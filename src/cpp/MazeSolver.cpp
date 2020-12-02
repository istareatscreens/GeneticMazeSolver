#include <algorithm>
#include <vector>
#include <iostream>
#include "Player.h"
/*
#include <mutex>
#include <execution>
#include <thread>
*/

#include <emscripten/emscripten.h>
#include <emscripten/bind.h>

//Execution Parameters
/*
const int populationSize = 50;
const double perBitMutationRate = 0.01;
const int plateauConstant = 100; //after x generations with no change in fitness end algorithm
const int maxGeneration = 500;
*/

//Threaded parameters:
//const int numberOfThreads = 8;
//std::mutex mutexLock;

EM_JS(void, sendPlayerData, (int generation, int done, char *coordinates), {
   dispatchEvent(new CustomEvent("gotCoordinates", {detail : {gen : generation, coord : UTF8ToString(coordinates), done : done}}));
});

void executeRouleteMateMatching(int &i, int j, int &selectedMate, std::vector<Player> &population, long generation);
void conductMate(Player parent1, Player parent2, std::vector<Player> &population, long generation);
//void solveMaze();
void rouleteWheelSelection(std::vector<float> fitnessProbabilities, std::vector<std::vector<int>> partitions, int matings, std::vector<Player> &population, long generation);
void solveMaze(int populationSize, double perBitMutationRate, int plateauConstant, int maxGeneration);

/*
const int populationSize = 50;
const double perBitMutationRate = 0.01;
const int plateauConstant = 100; //after x generations with no change in fitness end algorithm
const int maxGeneration = 500;
*/

double perBitMutationRate = 0.01;

void solveMaze(int populationSize, double perBitMutationRate, int plateauConstant, int maxGeneration)
{

   if (populationSize < 5)
   //check input conditions
   {
      populationSize = 5;
   }
   if (perBitMutationRate < 0 || perBitMutationRate > 1)
   {
      perBitMutationRate = 0;
   }
   if (plateauConstant < 0)
   {
      plateauConstant = 0;
   }
   if (maxGeneration < 0)
   {
      maxGeneration = 1;
   }
   ::perBitMutationRate = perBitMutationRate;

   //set up arrys
   std::vector<Player> population;
   std::vector<std::vector<int>> partitions;
   std::vector<int> fitnessValues;
   std::vector<float> fitnessProbabilities;
   long generation = 0, exitCounter = 0;

   //initialize population
   for (int i = 0; i < populationSize; i++)
   {
      population.push_back(Player{});
   }

   //sort to set up roulette wheel
   //   std::sort(std::execution::par_unseq, population.begin(), population.end(), Player::compareFitnesses); //sort inital population
   std::sort(population.begin(), population.end(), Player::compareFitnesses); //sort inital population

   short lastBestFitness = population.front().getFitness();
   while (true)
   {

      //get fitness value range and compute sum of fitness
      int fitnessSum{0};
      fitnessValues.clear();
      for (int fitness = population.back().getFitness(); fitness < population.front().getFitness() + 1; fitness++)
      {
         //if (std::execution::par_unseq, std::binary_search(population.begin(), population.begin() + populationSize, Player(fitness), Player::compareFitnesses))
         if (std::binary_search(population.begin(), population.begin() + populationSize, Player(fitness), Player::compareFitnesses))
         {
            fitnessValues.push_back(fitness);
            fitnessSum += fitness;
         }
      }

      //Generate fitness probabilities
      fitnessProbabilities.clear();
      fitnessProbabilities.push_back(static_cast<float>(fitnessValues[0]) / fitnessSum);
      for (unsigned int i = 1; i < fitnessValues.size() - 1; i++)
      {
         fitnessProbabilities.push_back((static_cast<float>(fitnessValues[i]) / fitnessSum) + fitnessProbabilities[i - 1]);
      }
      if (fitnessValues.size() != 1)
      {
         fitnessProbabilities.push_back(1);
      }

      //Create roulete wheel, that maps to indecies in
      partitions.clear();
      for (int fitnessValue : fitnessValues)
      {
         std::vector<int> temp;
         std::pair<std::vector<Player>::iterator, std::vector<Player>::iterator> bounds;
         bounds = (std::equal_range(population.begin(), population.begin() + populationSize, Player(fitnessValue), Player::compareFitnesses));
         temp.push_back(bounds.first - population.begin());
         temp.push_back(bounds.second - population.begin() - 1);
         temp.push_back(fitnessValue);
         partitions.push_back(temp);
      }

      //Roulete Wheel Selection (multiple threads)

      //threaded
      /*
      std::vector<std::thread> threads;
      for (int i = 0; i < numberOfThreads; i++)
      {
         threads.push_back(std::thread{rouleteWheelSelection, fitnessProbabilities, partitions, (populationSize / numberOfThreads), std::ref(population), generation});
         threads[i].join();
      }
      */

      //Threadless implementation
      rouleteWheelSelection(fitnessProbabilities, partitions, populationSize, population, generation);

      //place best candidates at start of array
      //std::sort(std::execution::par_unseq, population.begin(), population.end(), Player::compareFitnesses);
      std::sort(population.begin(), population.end(), Player::compareFitnesses);
      population = std::vector<Player>(population.begin(), population.begin() + populationSize);

      //Print Progress to console
      if ((lastBestFitness != population.front().getFitness() || generation == 0) && exitCounter == 0)
      {
         //population.front().printMovements();

         std::string coordinateString = population.front().generateCoordinateString();
         int length = coordinateString.length();

         // declaring character array
         char *char_array = new char[length + 1];
         // copying the contents of the
         // string to char array
         strcpy(char_array, coordinateString.c_str());
         //call javascript function
         sendPlayerData(population.front().getGeneration(), 0, char_array);
         delete[] char_array;
      }

      generation++;

      //save best solution
      if (population.front().getFitness() - generation > lastBestFitness - generation)
      {
         lastBestFitness = population.front().getFitness() - generation;
      }

      //Check if max generation
      if (maxGeneration == generation)
      {
         std::cout << "No solution found";
         return;
      }

      //check if plateaued
      if (population.front().hasSolvedMaze() && lastBestFitness == population.front().getFitness() - generation)
      {
         if (exitCounter > plateauConstant)
         {
            std::string coordinateString = population.front().generateCoordinateString();
            int length = coordinateString.length();
            // declaring character array
            char *char_array = new char[length + 1];
            // copying the contents of the
            // string to char array
            strcpy(char_array, coordinateString.c_str());
            //call javascript function
            sendPlayerData(population.front().getGeneration() - exitCounter, 1, char_array);
            delete[] char_array;
            return;
         }
         else
         {
            exitCounter++;
         }
      }
   }
}

void rouleteWheelSelection(std::vector<float> fitnessProbabilities, std::vector<std::vector<int>> partitions, int matings, std::vector<Player> &population, long generation)
{
   //establish random number generation
   std::random_device device;
   std::mt19937 random(device());
   std::uniform_real_distribution<float> probabilityDistribution(0, 1);
   int selectedMate = -1;
   for (int i = 0; i < matings; i++)
   { //conduct population/2 selections
      int j = std::distance(fitnessProbabilities.begin(), std::lower_bound(fitnessProbabilities.begin(), fitnessProbabilities.end(), probabilityDistribution(random)));
      executeRouleteMateMatching(i, (static_cast<int>(probabilityDistribution(random) * (partitions[j][1] - partitions[j][0])) + partitions[j][0]), selectedMate, population, generation);
   }
}

void executeRouleteMateMatching(int &i, int j, int &selectedMate, std::vector<Player> &population, long generation)
{
   if (selectedMate != -1)
   {

      //check for asexual reproduction
      if (selectedMate == j)
      {
         --i;
         return;
      }

      //check for inbreeding, to prevent rapid chromosome convergence in small populations
      //     mutexLock.lock();
      Player parent1{population[i]};
      Player parent2{population[j]};
      //      mutexLock.unlock();

      if (parent1.areRelated(parent2))
      {
         --i;
         return;
      }

      conductMate(parent1, parent2, population, generation);
      selectedMate = -1;
   }
   else
   {
      selectedMate = j;
   }
}

void conductMate(Player parent1, Player parent2, std::vector<Player> &population, long generation)
{
   //generate both children
   Player child1{parent1.generateOffspring(parent2, generation)};
   Player child2{parent2.generateOffspring(parent1, generation)};

   child1.conductMutation(perBitMutationRate);
   child2.conductMutation(perBitMutationRate);

   //   mutexLock.lock();
   population.push_back(child1);
   population.push_back(child2);
   //   mutexLock.unlock();
}

EMSCRIPTEN_BINDINGS(solve_maze)
{
   emscripten::function("solveMaze", &solveMaze);
}
