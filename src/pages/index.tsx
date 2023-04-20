import styles from "@/styles/Home.module.css";
import {
  Text,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Review } from "@/api/gpt";
import { SearchIcon } from "@chakra-ui/icons";
import { motion, useAnimationControls } from "framer-motion";

export default function Home() {
  const [url, setUrl] = useState("");
  const [review, setReview] = useState<Review>();
  const [gameId, setGameId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const controls = useAnimationControls();

  const start = () => {
    controls.start({ y: [0, -16, 0] });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const pattern: RegExp = /(\d{6,})/;
    const match: RegExpMatchArray | null = url.match(pattern);

    if (!match) return;

    try {
      setReview(undefined);
      setIsLoading(true);
      const gameId = match[1];
      const { data } = await axios.post<{ answer: Review }>("/api/gpt", {
        gameId,
      });
      setReview(data.answer);
      setGameId(gameId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) start();
  }, [isLoading, start]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Text
          position="fixed"
          top="40%"
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
          fontSize="160px"
          fontWeight="extrabold"
          opacity={0.4}
          overflow="hidden"
          whiteSpace="nowrap"
          transform="rotate(60deg)"
          pointerEvents="none"
        >
          Gamer GPT
        </Text>
        <Box
          zIndex={1}
          display="flex"
          flexDirection="column"
          w={400}
          m={6}
          p={4}
          background="rgba( 255, 255, 255, 0.1 )"
          boxShadow="0 8px 32px 0 rgba( 31, 38, 135, 0.1 )"
          borderRadius="10px"
          border="1px solid rgba( 255, 255, 255, 0.18 )"
        >
          <form onSubmit={onSubmit}>
            <FormControl display="flex">
              <FormLabel hidden>Steam Address</FormLabel>
              <InputGroup position="relative">
                <InputRightElement
                  position="absolute"
                  top={0}
                  right={0}
                  pointerEvents="none"
                >
                  <SearchIcon color="gray.600" />
                </InputRightElement>
                <Input
                  backgroundColor="rgba( 255, 255, 255, 0.3 )"
                  border="none"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  name="url"
                  placeholder="SteamのURLを入力してください..."
                  _placeholder={{ color: "gray.700" }}
                  disabled={isLoading}
                />
              </InputGroup>
            </FormControl>
          </form>
          {!review && (
            <>
              <Flex
                flexDirection="column"
                alignItems="center"
                w="100%"
                mt="50%"
              >
                <motion.div
                  animate={controls}
                  transition={{
                    duration: 1,
                    times: [0, 0.3, 1],
                    repeat: Infinity,
                  }}
                >
                  <Image
                    src={`https://twemoji.maxcdn.com/v/latest/svg/1f3ae.svg`}
                    alt={`ゲームコントローラーアイコン`}
                    width={80}
                    height={80}
                  />
                </motion.div>
                {isLoading && (
                  <Flex gap={1}>
                    {["L", "o", "a", "d", "i", "n", "g"].map((str, index) => (
                      <motion.div
                        key={index}
                        animate={{ y: [0, -16, 0] }}
                        transition={{
                          duration: 1,
                          times: [0, 0.3, 1],
                          repeat: Infinity,
                          delay: index * 0.1,
                        }}
                        style={{ fontSize: "24px" }}
                      >
                        {str}
                      </motion.div>
                    ))}
                  </Flex>
                )}
              </Flex>
            </>
          )}
          {review && gameId && (
            <motion.div
              animate={{
                opacity: [0, 1],
                transform: ["translateY(64px)", "translateY(0px)"],
              }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={`https://cdn.akamai.steamstatic.com/steam/apps/${gameId}/header.jpg`}
                alt={`ゲームアイキャッチ`}
                width={365}
                height={200}
                style={{ marginTop: "16px", borderRadius: "4px" }}
              />
            </motion.div>
          )}
          {review && (
            <>
              <motion.div
                animate={{
                  opacity: [0, 1],
                  transform: ["translateY(64px)", "translateY(0px)"],
                }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Flex
                  mt={4}
                  p={3}
                  w={16}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="rgba( 135, 206, 235, 0.6 )"
                  borderRadius="10px"
                  border="1px solid rgba( 255, 255, 255, 0.1 )"
                >
                  <Image
                    src={`https://twemoji.maxcdn.com/v/latest/svg/1f44d.svg`}
                    alt={`goodアイコン`}
                    width={32}
                    height={32}
                  />
                </Flex>
                <Box
                  display="flex"
                  flexDirection="column"
                  mt={4}
                  p={4}
                  background="rgba( 135, 206, 235, 0.6 )"
                  boxShadow="0 8px 32px 0 rgba( 31, 38, 135, 0.1 )"
                  borderRadius="10px"
                  border="1px solid rgba( 255, 255, 255, 0.1 )"
                >
                  <Box>
                    <UnorderedList>
                      {review.positives.map((p, index) => (
                        <ListItem key={index}>{p}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                </Box>
              </motion.div>
              <motion.div
                animate={{
                  opacity: [0, 1],
                  transform: ["translateY(64px)", "translateY(0px)"],
                }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <Flex
                  mt={4}
                  p={3}
                  w={16}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="rgba( 235, 167, 134, 0.7 )"
                  borderRadius="10px"
                  border="1px solid rgba( 255, 255, 255, 0.1 )"
                >
                  <Image
                    src={`https://twemoji.maxcdn.com/v/latest/svg/1f44e.svg`}
                    alt={`badアイコン`}
                    width={32}
                    height={32}
                  />
                </Flex>
                <Box
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  mt={4}
                  p={4}
                  background="rgba( 235, 167, 134, 0.7 )"
                  boxShadow="0 8px 32px 0 rgba( 31, 38, 135, 0.1 )"
                  borderRadius="10px"
                  border="1px solid rgba( 255, 255, 255, 0.18 )"
                >
                  <Box>
                    <UnorderedList>
                      {review.negatives.map((n, index) => (
                        <ListItem key={index}>{n}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                </Box>
              </motion.div>
            </>
          )}
        </Box>
      </main>
    </>
  );
}
