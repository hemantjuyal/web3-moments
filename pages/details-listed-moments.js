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
import AES from 'crypto-js/aes';
import {
  enc
} from 'crypto-js';
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
const salt = process.env.NEXT_PUBLIC_SECRET_SALT;

export default function DetailsNFT() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [formInput, updateFormInput] = useState({
    transferTo: ''
  })
  const router = useRouter()

  function getParams(param) {
    const dehashing = (data) => {
      const str = decodeURIComponent(data);
      const dehash = AES.decrypt(str, salt).toString(enc.Utf8);
      return dehash;
    }
    const paramData = dehashing(param);
    return paramData;
  }

  const id = getParams(router.query.id);

  useEffect(() => {
    loadNFTsDetails()
  }, [id])

  async function loadNFTsDetails() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, Web3Marketplace.abi, signer)
    const data = await contract.fetchItemsListedDetails(id)

    const tokenUri = await contract.tokenURI(data.tokenId)
    const meta = await axios.get(tokenUri)
    const submetadata = await axios.get(meta.data.metadata)
    let price = ethers.utils.formatUnits(data.price.toString(), 'ether')
    let item = {
      price,
      tokenId: data.tokenId.toNumber(),
      seller: data.seller,
      owner: data.owner,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
      highlights: submetadata.data.metadata.highlights,
      tags: submetadata.data.metadata.tags
    }

    setNfts(item)
    setLoadingState('loaded')
  }

  async function transferNFT() {
    const transferTo = window.prompt("Please enter transfer to address", '');
    if (transferTo != null && transferTo != "") {
      try {
        const web3Modal = new Web3Modal({
          network: 'mainnet',
          cacheProvider: true,
        })
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const contract = new ethers.Contract(marketplaceAddress, Web3Marketplace.abi, signer)
        const data = await contract.fetchItemsListedDetails(id)

        const isTransferred = await contract.transferItemsListed(transferTo, data.tokenId)
        alert('Transfer Success');
        router.push('/')
      } catch (error) {
        console.error('error: ', error);
        alert("Please provide a valid transfer address");
      }

    } else {
      alert("Please provide a valid transfer address");
    }


  }

  if (loadingState === 'loaded' && !nfts.tokenId) return ( <h1 className="bg-transparent mr-4 text-purple-800"> Nothing Found </h1> )


    return (
    <Grid.Container gap={2} justify="flex-start">
        <Grid xs={6} sm={3} key={id}>
          <Card css={{ w: "100%", h: "400px" }}>
            <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
              <Col>
                <Text size={12} weight="bold" transform="uppercase" color="#9E9E9E">
                  {nfts.name}
                </Text>
                <Text h3 color="white">
                  {nfts.description}
                </Text>
              </Col>
            </Card.Header>
            <Card.Body css={{ p: 0 }}>
              <Card.Image
                src={nfts.image}
                objectFit="cover"
                width="100%"
                height="100%"
                alt={nfts.name}
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
                        src={nfts.image}
                        css={{ bg: "black", br: "50%" }}
                        height={40}
                        width={40}
                        alt={nfts.name}
                      />
                    </Col>
                    <Col>
                      <Text color="#d1d1d1" size={12}>
                        {nfts.name}
                      </Text>
                      <Text color="#d1d1d1" size={12}>
                        {nfts.tags}
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
                      onPress = {() => transferNFT()} 
                      >
                      <Text
                        css={{ color: "inherit" }}
                        size={12}
                        weight="bold"
                        transform="uppercase">
                        Transfer Moments
                      </Text>
                    </Button>
                  </Row>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </Grid>
    </Grid.Container>
  );


}
