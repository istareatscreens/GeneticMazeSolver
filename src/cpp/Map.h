#ifndef MAP_H
#define MAP_H

class Map
{

private:
   //Array helper functions
   int getArrayElement(int x, int y, bool validMove) const;
   int getArrayIndex(int x, int y) const;
   int *map;
   const int map_width;
   const int map_height;
   const int startingX;
   const int startingY;
   const int endX;
   const int endY;

public:
   //Constructors/Destructors
   Map(int *map, const int map_width, const int map_height, const int startingX, const int startingY, const int endX, const int endY);
   Map();
   ~Map();
   Map(Map &);
   Map &operator=(const Map &) const;
   int getStartingPosition() const;
   int getStartingX() const;
   int getStartingY() const;
   int moveNorth(int x, int y) const; //00
   int moveSouth(int x, int y) const; //01
   int moveEast(int x, int y) const;  //10
   int moveWest(int x, int y) const;  //11
   int distanceFromExit(int x, int y) const;
   int getPosition(int x, int y) const;
};

#endif
