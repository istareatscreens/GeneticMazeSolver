#include "Player.h"
#include <bitset>
#include <iostream>

using namespace std;
Map Player::map{};

//Constructors and initialization functions
Player::Player() : Player(generateChromosome(), 0)
{
}

Player::Player(uint64_t chromosome, long generation)
{
   this->generation = generation;
   this->chromosome = chromosome;
   generateMoveHistory(); //generate solution
   calculateFitness();    //compute success
}

uint64_t Player::generateChromosome()
{
   std::random_device rd;
   std::mt19937_64 gen(rd());
   std::uniform_int_distribution<uint64_t> dis;
   return dis(gen);
}

//Calculate fitness
void Player::calculateFitness()
{
   if (movementHistory.size() > 0)
   { //account for small possibility of no useful moves
      auto x = movementHistory.back()[0];
      auto y = movementHistory.back()[1];
      auto distanceFromExit = map.distanceFromExit(x, y);

      //Select for closes to exit, if exit is reached select for least number of moves, add generation to induce aging to increase diversity
      fitness = (32 - distanceFromExit) + ((reachedGoal) ? 32 - movementHistory.size() : 0) + generation;
   }
   else
   {
      fitness = 0;
   }
}

//Solution generation function
void Player::generateMoveHistory()
{

   unsigned int x = map.getStartingX();
   unsigned int y = map.getStartingY();
   uint64_t iterate;

   for (int i = 0, j = 0; i < 32; i++)
   {
      unsigned int move = 0b11 & (iterate = (i == 0) ? chromosome >> 2 : iterate >> 2);
      bool invalidMove = false;
      int moveResult = conductMove(move, x, y, invalidMove);

      //dont save useless moves
      if (invalidMove)
      {
         continue;
      }
      else if (j > 1 //Dont save redundant moves
               && (x == movementHistory[j - 2][0] && y == movementHistory[j - 2][1]))
      {
         movementHistory.erase(movementHistory.begin() + j - 1);
         j--;
         continue;
      }

      std::vector<unsigned int> temp;
      temp.push_back(x);
      temp.push_back(y);
      temp.push_back(move);
      movementHistory.push_back(temp);
      temp.clear();
      j++;

      if (moveResult == 4)
      { //Died
         isDead = true;
         break;
      }
      else if (moveResult == 3)
      { // Found Goal
         reachedGoal = true;
         break;
      }
   }
}

unsigned int Player::conductMove(unsigned int move, unsigned int &x, unsigned int &y, bool &invalidMove)
{
   switch (move)
   {
   case 0: //00
      return checkMove(map.moveNorth(x, --y), y, true, invalidMove);
      break;
   case 1: //01
      return checkMove(map.moveEast(++x, y), x, false, invalidMove);
   case 2: //10
      return checkMove(map.moveWest(--x, y), x, true, invalidMove);
   case 3: //11
      return checkMove(map.moveSouth(x, ++y), y, false, invalidMove);
   default:
      std::cout << "Logic Error";
      exit(1);
   }
}

inline int Player::checkMove(int moveResult, unsigned int &coordinate, bool shouldIncrement, bool &invalidMove)
{
   if (moveResult == 1 || moveResult == -1)
   {
      if (shouldIncrement)
         coordinate++;
      else
         coordinate--;
      invalidMove = true;
   }
   return moveResult;
}

//Offspring generation
uint64_t Player::conductCrossOver(uint64_t chromosome1, uint64_t chromosome2)
{
   return (chromosome1 << 32) >> 32 | (chromosome2 >> 32) << 32;
}

Player Player::generateOffspring(Player player, long generation)
{

   //establish random number generation
   Player child{conductCrossOver(player.chromosome, chromosome), generation};
   return child;
}

//Mutation
void Player::conductMutation(double perBitMutationRate)
{
   std::random_device device;
   std::mt19937 random(device());
   std::uniform_int_distribution<uint64_t> distributionInts;
   std::uniform_real_distribution<> distributionZeroToOne(0, 1);

   //Mutate child
   for (int i = 0; i < 64; i++)
   {
      if (distributionZeroToOne(random) < perBitMutationRate)
      {
         mutate(distributionInts(random));
      }
   }
}

void Player::mutate(uint64_t randomNumber)
{
   //std::cout << "Mutation bit:    " <<std::bitset<64>(static_cast<uint64_t>(1)<<(randomNumber%64))<<"\n";
   chromosome ^= (static_cast<uint64_t>(1) << (randomNumber % 64));
}

//Getters
long Player::getGeneration() const
{
   return generation;
}

std::vector<std::vector<unsigned int>> Player::getMovementHistory()
{
   return movementHistory;
}

bool Player::hasSolvedMaze() const
{
   return reachedGoal;
}
float Player::getMateProbability(int totalFitness)
{
   return static_cast<float>(fitness) / totalFitness;
}

//Print solution
void Player::printMovements()
{
   std::cout << "Generation #" << generation << " Fitness: " << fitness - generation << " Moves: " << movementHistory.size() << std::endl;
   std::cout << "Start-->(" << map.getStartingX() << ", " << map.getStartingY() << "), " << std::endl;
   for (long unsigned int i = 0; i < movementHistory.size() - 1; i++)
   {
      std::cout << "\t" << getDirection(movementHistory[i][2]) << "-->"
                << "(" << movementHistory[i][0] << ", " << movementHistory[i][1] << "), " << std::endl;
   }
   //Print out last message
   int lastPositionX = movementHistory.back()[0];
   int lastPositionY = movementHistory.back()[1];
   std::cout << "\t" << getDirection(movementHistory.back()[2]) << "-->"
             << "(" << lastPositionX << ", " << lastPositionY << ") ";

   //print end message
   switch (map.getPosition(lastPositionX, lastPositionY))
   {
   case 3:
      std::cout << " --> GOAL!";
      break;
   case 0:
      std::cout << " --> LOST!";
      break;
   case 4:
      std::cout << " --> DEAD!";
      break;
   case 2:
      std::cout << " --> BACK AT START!";
      break;
   case 1:
      std::cout << " --> IN WALL!";
      break;
   }
   std::cout << std::endl;
}

std::string Player::getDirection(unsigned int direction)
{
   switch (direction)
   {
   case 0: //00
      return "north";
   case 1: //01
      return "east";
   case 2: //10
      return "west";
   case 3: //11
      return "south";
   default:
      return "invalid direction";
   }
}

bool Player::compareFitnesses(Player player1, Player player2)
{
   return player1.fitness > player2.fitness;
}

bool Player::compareChromosome(Player player1, Player player2)
{
   return player1.chromosome > player2.chromosome;
}

int Player::getFitness() const
{
   return fitness;
}

//Operators
bool Player::operator!=(const Player right) const
{
   return fitness != right.fitness;
}

bool Player::operator==(const Player right) const
{
   return fitness == right.fitness;
}

bool Player::areRelated(Player player)
{
   return (((chromosome << 32) >> 32) == ((player.chromosome << 32) >> 32) || ((chromosome >> 32) << 32) == ((player.chromosome >> 32) << 32));
}

bool Player::operator<(const Player right) const
{
   return fitness < right.fitness;
}
