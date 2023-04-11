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

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({
    price: '',
    image: ''
  })
  const router = useRouter()
  const {
    id,
    tokenURI
  } = router.query
  const {
    image,
    price
  } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({
      ...state,
      image: meta.data.image
    }))
  }

  async function listNFTForSale() {

    if (!price) {
      alert("Please enter a price");
      return;
    } else if (price < 0) {
      alert("Please enter a valid price");
      return;
    } else if (isNaN(price)) {
      alert("Please enter a valid price");
      return;
    } else {

      try {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
        let contract = new ethers.Contract(marketplaceAddress, Web3Marketplace.abi, signer)
        let listingPrice = await contract.getListingPrice()

        listingPrice = listingPrice.toString()
        let transaction = await contract.resellToken(id, priceFormatted, {
          value: listingPrice
        })
        await transaction.wait()

        router.push('/')

      } catch (error) {
        console.error('error: ', error)
      }

    }


  }

  return (
    <div className="bg-transparent flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Price in ETH"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}/>
        { image && (<Image className="rounded mt-4" alt="" width={350} height={300} src={image} />) }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-purple-800 text-white rounded p-4 shadow-lg">
          List This Moment
        </button>
      </div>
    </div>
  )
}
