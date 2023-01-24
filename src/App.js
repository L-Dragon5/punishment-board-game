import { DeleteIcon } from '@chakra-ui/icons';
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
  IconButton,
  Input,
  ListItem,
  SimpleGrid,
  Square,
  Text,
  UnorderedList,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';

function App() {
  const [spaceInput, setSpaceInput] = useState('');
  const [allSpaces, setAllSpaces] = useState(
    localStorage.getItem('allSpaces')
      ? JSON.parse(localStorage.getItem('allSpaces'))
      : [],
  );
  const [startGame, setStartGame] = useState(false);
  const [splitValue, setSplitValue] = useState(0);
  const [gameName, setGameName] = useState('');
  const [boardRoll, setBoardRoll] = useState(0);
  const [boardPosition, setBoardPosition] = useState(0);

  const formRef = useRef();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function handleSpaceAdd(e) {
    e.preventDefault();
    setAllSpaces((prevState) => [...prevState, spaceInput]);
    formRef.current.reset();
  }

  function handleSpaceDelete(findIndex) {
    setAllSpaces((prevState) =>
      prevState.filter((value, index) => index !== findIndex),
    );
  }

  function handleGameStart(e) {
    e.preventDefault();

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
          <Container background="white" maxW="container.lg" p={6} boxShadow="lg">
            <Heading textAlign="center" mb={6}>Punishment Board Layout Generator</Heading>
            <SimpleGrid columns={2} spacing={10}>
              <VStack ref={formRef} as="form" onSubmit={handleSpaceAdd}>
                <FormControl id="space-name">
                  <FormLabel>Enter Board Space Name</FormLabel>
                  <Input onChange={(e) => setSpaceInput(e.target.value)} />
                  <FormHelperText>
                    Place in order from top left going clockwise
                  </FormHelperText>
                </FormControl>
                <Button type="submit" colorScheme="orange">
                  Add Space
                </Button>
                <UnorderedList>
                  {allSpaces.map((space, index) => (
                    <ListItem key={space}>
                      <IconButton
                        aria-label={`Delete ${space}`}
                        icon={<DeleteIcon />}
                        onClick={() => handleSpaceDelete(index)}
                        mr={4}
                      />
                      {space}
                    </ListItem>
                  ))}
                </UnorderedList>
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
        )}
      </Flex>
    </ChakraProvider>
  );
}

export default App;
