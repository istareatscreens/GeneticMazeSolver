#ifndef PLAYER_H
#define PLAYER_H

#include "Map.h"
#include <random>
#include <vector>

class Player
{
private:
   static Map map;
   //Random number generation
   long unsigned int fitness;
   uint64_t chromosome;
   long generation;
   std::vector<std::vector<unsigned int>> movementHistory; //x,y,direction
   bool reachedGoal{false};
   bool isDead{false};
   Player(uint64_t chromosome, long generation);
   uint64_t generateChromosome();
   //Fitness functions
   void calculateFitness();
   //Solution generation function
   void generateMoveHistory();
   inline int checkMove(int moveResult, unsigned int &coordinate, bool shouldIncrement, bool &invalidMove);
   unsigned int conductMove(unsigned int move, unsigned int &x, unsigned int &y, bool &invalidMove);
   //Mating
   uint64_t conductCrossOver(uint64_t chromosome1, uint64_t chromosome2);
   void mutate(uint64_t randomNumber);
   //print help
   std::string getDirection(unsigned int);

public:
   Player();
   Player(int fitness) : fitness(fitness), chromosome(0), generation(-1){};
   static bool compareFitnesses(Player, Player);
   static bool compareChromosome(Player, Player);
   std::vector<std::vector<unsigned int>> getMovementHistory();
   Player generateOffspring(Player player, long generation);
   void conductMutation(double perBitMutationRate);
   float getMateProbability(int totalFitness);
   bool areRelated(Player player);
   void printMovements();
   long getGeneration() const;
   int getNumberOfMoves() const;
   int getFitness() const;
   std::string generateCoordinateString();
   bool hasSolvedMaze() const;
   bool operator!=(const Player right) const;
   bool operator==(const Player right) const;
   bool operator<(const Player right) const;
};

#endif /* ifndef PLAYER_H */
