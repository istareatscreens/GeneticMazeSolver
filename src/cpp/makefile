MazeSolver: MazeSolver.o Player.o Map.o
	emcc -std=c++17 -O3 -s ENVIRONMENT=worker -s MODULARIZE=1 -s 'EXPORT_NAME="createModule"'  -Wconversion -Wall -Werror -Wextra -Wno-conversion -pedantic -g3 MazeSolver.o Player.o Map.o -o maze_wasm.js --bind 
	mv *.o ../../build/ &
	mv *.gch ../../build/ &
	mv *.wasm ../../src/wasm/ &
	mv maze_wasm.js ../../src/wasm/

MazeSolver.o: MazeSolver.cpp
	emcc -std=c++17 -Wconversion -Wall -Werror -Wextra -Wno-conversion -pedantic -g3 -c MazeSolver.cpp

Player.o: Player.cpp 
	emcc -std=c++17 -Wconversion -Wall -Werror -Wextra -Wno-conversion -pedantic -g3 -c Player.cpp 

Map.o: Map.cpp
	emcc -std=c++17 -Wconversion -Wall -Werror -Wextra -Wno-conversion -pedantic -g3 -c Map.cpp
