import {
  Box,
  Button,
  ChakraProvider,
  Container,
  Fade,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  OrderedList,
  SimpleGrid,
  Square,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {
  closestCenter,
  DndContext, 
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useEffect, useRef, useState } from 'react';

import { SortableSpace } from './SortableSpace';

function App() {
  const [spaceInput, setSpaceInput] = useState(''); // Input for adding a space.
  const [allSpaces, setAllSpaces] = useState(
    localStorage.getItem('allSpaces')
      ? JSON.parse(localStorage.getItem('allSpaces'))
      : [],
  ); // All board spaces.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  ); // Sensors for board spaces drag-and-drop.

  const [startGame, setStartGame] = useState(false); // Editor vs Display flag.
  const [splitValue, setSplitValue] = useState(0); // How many spaces on each side of square.
  const [gameName, setGameName] = useState(''); // Board name in center.
  const [boardRoll, setBoardRoll] = useState(0); // "Dice" roll.
  const [boardPosition, setBoardPosition] = useState(0); // Position on board/array

  const formRef = useRef(); // Form ref used for reset.

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure(); // "Dice" roll fade.

  // Generate a "dice" roll, random int, min-max included.
  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Handle adding board space.
  function handleSpaceAdd(e) {
    e.preventDefault();
    if (spaceInput === '' || spaceInput.length < 1) {
      toast({
        title: 'Board Space Input',
        description: 'Need to input a value',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    } else if (allSpaces.includes(spaceInput)) {
      toast({
        title: 'Board Space Input',
        description: 'Board space already exists',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setAllSpaces((prevState) => [...prevState, spaceInput]);
    formRef.current.reset();
  }

  // Handle deleting board space.
  function handleSpaceDelete(space) {
    setAllSpaces((prevState) =>
      prevState.filter((value) => value !== space),
    );
  }

  // Handle moving board space in list.
  function handleDragEnd(e) {
    const { active, over } = e;

    if (active.id !== over.id) {
      setAllSpaces((prevState) => {
        const oldIndex = prevState.indexOf(active.id);
        const newIndex = prevState.indexOf(over.id);
        return arrayMove(prevState, oldIndex, newIndex);
      })
    }
  }

  // Handle switch from editor to display.
  function handleGameStart(e) {
    e.preventDefault();

    // Check to make sure board spaces exist and are evenly placeable.
    if (allSpaces.length < 1) {
      toast({
        title: 'Game Start Error',
        description: 'Need board spaces to start',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    } else if (allSpaces.length % 4 !== 0) {
      toast({
        title: 'Game Start Error',
        description: 'Total board spaces needs to be divisible by 4',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setGameName(e.target.elements.board_name.value);
    const split = Math.ceil(allSpaces.length / 4);
    setAllSpaces((prevState) => [
      e.target.elements.top_left.value,
      ...prevState.slice(0, split),
      e.target.elements.top_right.value,
      ...prevState.slice(split, split * 2),
      e.target.elements.bottom_right.value,
      ...prevState.slice(split * 2, split * 3),
      e.target.elements.bottom_left.value,
      ...prevState.slice(split * 3, split * 4),
    ]);
    setSplitValue(split);
    setStartGame(true);
  }

  // "Roll Dice"
  function handleRoll(e) {
    e.preventDefault();
    const value = randomIntFromInterval(1, allSpaces.length <= 12 ? 3 : 6);
    setBoardRoll(value);
    setBoardPosition((prevState) => (prevState + value) % allSpaces.length);
    setTimeout(() => {
      onClose();
    }, 3000);
    onOpen();
  }

  // Whenever space list gets changed, store to local storage.
  useEffect(() => {
    if (!startGame) {
      localStorage.setItem('allSpaces', JSON.stringify(allSpaces));
    }
  }, [allSpaces]);

  return (
    <ChakraProvider resetCSS>
      <Flex overflow="hidden" h="100vh" w="100vw" alignItems="center" background="blue.100">
        {startGame ? (
          <Box background="orange.100" h="full" width="full">
            <VStack
              position="absolute"
              w={((splitValue + 2) * 150) / 2}
              top={((splitValue + 1) * 150) / 2}
              left={((splitValue + 2) * 150) / 4}
            >
              <Heading>{gameName}</Heading>
              <Button onClick={handleRoll}>Roll and Move</Button>
              <Fade in={isOpen}>
                <Text>Rolled a {boardRoll}!</Text>
              </Fade>
            </VStack>
            {allSpaces.map((space, index) => {
              let background;
              let fontWeight = 'normal';
              if (index % (splitValue + 1) === 0) {
                background = 'orange.300';
                fontWeight = 'bold';
              } else {
                background = 'teal.300';
              }
              if (index === boardPosition) {
                background = 'pink.200';
              } 

              if (index < splitValue + 2) {
                // Move Right
                return (
                  <Square
                    key={space}
                    background={background}
                    size="150px"
                    position="absolute"
                    left={index * 150}
                    userSelect="none"
                    textAlign="center"
                    fontWeight={fontWeight}
                  >
                    {space}
                  </Square>
                );
              } else if (index < splitValue * 2 + 3) {
                // Move Down
                return (
                  <Square
                    key={space}
                    background={background}
                    size="150px"
                    position="absolute"
                    left={150 * (splitValue + 1)}
                    top={150 * (index - (splitValue + 1))}
                    userSelect="none"
                    textAlign="center"
                    fontWeight={fontWeight}
                  >
                    {space}
                  </Square>
                );
              } else if (index < splitValue * 3 + 4) {
                // Move Left
                return (
                  <Square
                    key={space}
                    background={background}
                    size="150px"
                    position="absolute"
                    left={150 * (splitValue * 3 + 3) - (index * 150)}
                    top={150 * (splitValue + 1)}
                    userSelect="none"
                    textAlign="center"
                    fontWeight={fontWeight}
                  >
                    {space}
                  </Square>
                );
              } else {
                // Move Up
                return (
                  <Square
                    key={space}
                    background={background}
                    size="150px"
                    position="absolute"
                    left={0}
                    top={150 * (splitValue * 4 + 4) - (index * 150)}
                    userSelect="none"
                    textAlign="center"
                    fontWeight={fontWeight}
                  >
                    {space}
                  </Square>
                );
              }
            })}
          </Box>
        ) : (
          <>
          <Container background="white" maxW="container.lg" p={6} boxShadow="lg">
            <Heading textAlign="center" mb={6}>Punishment Board Layout Generator</Heading>
            <SimpleGrid columns={2} spacing={10}>
              <VStack ref={formRef} as="form" onSubmit={handleSpaceAdd}>
                <FormControl id="space-name" isRequired>
                  <FormLabel>Enter Board Space Name</FormLabel>
                  <Input onChange={(e) => setSpaceInput(e.target.value)} />
                  <FormHelperText>
                    Place in order from top left going clockwise. You can drag-and-drop the list items to change the order.
                  </FormHelperText>
                </FormControl>
                <Button type="submit" colorScheme="orange">
                  Add Space
                </Button>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                  <SortableContext items={allSpaces} strategy={verticalListSortingStrategy}>
                    <OrderedList>
                      {allSpaces.map((space) => (
                        <SortableSpace key={space} id={space} handleDelete={handleSpaceDelete} />
                      ))}
                    </OrderedList>
                  </SortableContext>
                </DndContext>
              </VStack>

              <VStack as="form" onSubmit={handleGameStart}>
                <FormControl id="board-game-name" isRequired>
                  <FormLabel>Enter Board Game Name</FormLabel>
                  <Input name="board_name" />
                </FormControl>
                <FormControl id="top-left-name" isRequired>
                  <FormLabel>Top-Left Corner Name</FormLabel>
                  <Input name="top_left" value="GO!" isDisabled />
                </FormControl>
                <FormControl id="top-right-name" isRequired>
                  <FormLabel>Top-Right Corner Name</FormLabel>
                  <Input name="top_right" defaultValue="Jail" />
                </FormControl>
                <FormControl id="bottom-right-name" isRequired>
                  <FormLabel>Bottom-Right Corner Name</FormLabel>
                  <Input name="bottom_right" defaultValue="Free Parking" />
                </FormControl>
                <FormControl id="bottom-left-name" isRequired>
                  <FormLabel>Bottom-Left Corner Name</FormLabel>
                  <Input name="bottom_left" defaultValue="Go to Jail" />
                </FormControl>
                <Button type="submit" width="full" colorScheme="orange">
                  Start Board
                </Button>
              </VStack>
            </SimpleGrid>
          </Container>
          <Box position="fixed" bottom="0" left="50%">
            <Text size="xs">Built by L-Dragon#0555</Text>
          </Box>
          </>
        )}
      </Flex>
    </ChakraProvider>
  );
}

export default App;
