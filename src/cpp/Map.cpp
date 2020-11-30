#include "Map.h"
#include <cmath>

Map::Map(int *map, const int map_width, const int map_height, int startingX, int startingY, const int endX, const int endY) : map(map), map_width(map_width), map_height(map_height), startingX(startingX), startingY(startingY), endX(endX), endY(endY) {}

Map::Map() : map(new int[15 * 10]{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 4, 0, 1, 2, 0, 0, 0, 0, 4, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 4, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 4, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}), map_width(15), map_height(10), startingX(0), startingY(2), endX(14), endY(7) {}

Map::~Map()
{
    delete[] map;
}

//getters
int Map::getStartingPosition() const
{
    return map[getArrayIndex(startingX, startingY)];
}

Map::Map(Map &copy) : map_width(copy.map_width), map_height(copy.map_height), startingX(copy.startingX), startingY(copy.startingY), endX(copy.endX), endY(copy.endY)
{
    map = new int[map_width * map_height];
    for (int i = 0; i < map_width * map_height; i++)
    {
        map[i] = copy.map[i];
    }
}

int Map::getStartingX() const
{
    return startingX;
}

int Map::getStartingY() const
{
    return startingY;
}

int Map::getPosition(int x, int y) const
{
    return map[getArrayIndex(x, y)];
}
//Movement functions
int Map::moveNorth(int x, int y) const
{
    return getArrayElement(x, y, y - 1 < 0);
}

int Map::moveSouth(int x, int y) const
{
    return getArrayElement(x, y, y + 1 > map_height);
}
int Map::moveEast(int x, int y) const
{
    return getArrayElement(x, y, x + 1 > map_width);
}

int Map::moveWest(int x, int y) const
{
    return getArrayElement(x, y, y - 1 < 0);
}

//Array helper functions
int Map::getArrayIndex(int x, int y) const
{
    return map_width * y + x;
}

int Map::distanceFromExit(int x, int y) const
{
    return abs(x - endX) + abs(y - endY); //manhattan distance
}

int Map::getArrayElement(int x, int y, bool validMove) const
{
    if (validMove)
    {
        return -1;
    }
    else
    {
        return map[getArrayIndex(x, y)];
    }
}
