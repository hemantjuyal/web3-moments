import {
  ethers
} from 'ethers'
import {
  useEffect,
  useState
} from 'react'
import axios from 'axios'
import {
  useRouter
} from 'next/router'
import Image from 'next/image';
import Web3Modal from 'web3modal'
import getConfig from 'next/config'
import {
  marketplaceAddress
} from '../config'
import Web3Marketplace from '../artifacts/contracts/Web3Marketplace.sol/Web3Marketplace.json'
import {
  Card,
  Grid,
  Row,
  Text,
  Col,
  Button
} from "@nextui-org/react";
const {
  publicRuntimeConfig
} = getConfig()

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])


  async function loadNFTs() {
    const networkEndpoint = process.env.NEXT_PUBLIC_NETWORK_ENDPOINT_URL;
    const provider = new ethers.providers.JsonRpcProvider(networkEndpoint)
    const contract = new ethers.Contract(marketplaceAddress, Web3Marketplace.abi, provider)
    const data = await contract.fetchMarketItems()

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      const submetadata = await axios.get(meta.data.metadata)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        highlights: submetadata.data.metadata.highlights,
        tags: submetadata.data.metadata.tags
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }

  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(marketplaceAddress, Web3Marketplace.abi, signer)

      /* user will be prompted to pay the asking proces to complete the transaction */
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price
      })
      await transaction.wait()

    } catch (error) {
      console.error(error);
    }

    loadNFTs()
  }

  if (loadingState === 'loaded' && !nfts.length) return ( <h1 className = "bg-transparent mr-4 text-purple-800" > No Moments Found </h1> )
    

  return (
    <Grid.Container gap={2} justify="flex-start">
      {nfts.map((nft, index) => (
        <Grid xs={6} sm={3} key={index}>
          <Card css={{ w: "100%", h: "400px" }}>
            <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
              <Col>
                <Text size={12} weight="bold" transform="uppercase" color="#9E9E9E">
                  {nft.name}
                </Text>
                <Text h3 color="white">
                  {nft.description}
                </Text>
              </Col>
            </Card.Header>
            <Card.Body css={{ p: 0 }}>
              <Card.Image
                src={nft.image}
                objectFit="cover"
                width="100%"
                height="100%"
                alt={nft.name}
              />
            </Card.Body>
            <Card.Footer
              isBlurred
              css={{
                position: "absolute",
                bgBlur: "#0f111466",
                borderTop: "$borderWeights$light solid $gray800",
                bottom: 0,
                zIndex: 1,
              }}>
              <Row>
                <Col>
                  <Row>
                    <Col span={3}>
                      <Card.Image
                        src={nft.image}
                        css={{ bg: "black", br: "50%" }}
                        height={40}
                        width={40}
                        alt={nft.name}
                      />
                    </Col>
                    <Col>
                      <Text color="#d1d1d1" size={12}>
                        {nft.name}
                      </Text>
                      <Text color="#d1d1d1" size={12}>
                        {nft.tags}
                      </Text>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <Row justify="flex-end">
                    <Button
                      flat
                      auto
                      rounded
                      css={{ color: "#FFFFFF", bg: "#800080" }}
                      onPress = {() => buyNft(nft)} 
                      >
                      <Text
                        css={{ color: "inherit" }}
                        size={12}
                        weight="bold"
                        transform="uppercase">
                        Buy This Moment
                      </Text>
                    </Button>
                  </Row>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </Grid>
      ))}
    </Grid.Container>
  );


  }
