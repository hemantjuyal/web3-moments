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
  create as ipfsHttpClient
} from 'ipfs-http-client'
import {
  marketplaceAddress
} from '../config'
import Web3Marketplace from '../artifacts/contracts/Web3Marketplace.sol/Web3Marketplace.json'

const {
  publicRuntimeConfig
} = getConfig()
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const secret = process.env.NEXT_PUBLIC_API_KEY_SECRET;
const ipfsEndpoint = process.env.NEXT_PUBLIC_IPFS_API_ENDPOINT;
const gateway = process.env.NEXT_PUBLIC_DEDICATED_GATEWAY;

const auth = 'Basic ' + Buffer.from(projectId + ':' + secret).toString('base64');
const ipsConfig = ((ipfsEndpoint && ipfsEndpoint.indexOf('localhost') != -1) ?
  ({
    url: ipfsEndpoint,
  }) :
  ({
    url: ipfsEndpoint,
    headers: {
      authorization: auth,
    },
  }));

const client = ipfsHttpClient(ipsConfig);

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [dataUrl, setDataUrl] = useState(null)
  // const [isLoading, setIsLoading] = useState(false);
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: '',
    highlights: '',
    tags: '',
  })
  const router = useRouter()

  useEffect(() => {}, [])

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      const added_data = await client.add(
        file, {
          progress: (prog) => console.log('')
        }
      )
      const url_added_data = `${gateway}/ipfs/${added_data.path}`
      setFileUrl(url_added_data)
    } catch (error) {
      console.error('Error uploading file: ', error)
    }

    try {
      const added_meta_data = await client.add(JSON.stringify({
        metadata: {
          highlights: formInput.highlights,
          tags: formInput.tags
        }
      }));
      const url_added_meta_data = `${gateway}/ipfs/${added_meta_data.path}`
      setDataUrl(url_added_meta_data)
    } catch (error) {
    }

  } //end

  async function uploadToIPFS() {
    const {
      name,
      description,
      price,
      highlights,
      tags
    } = formInput

    if (!name || !description || !price || !highlights || !tags || !fileUrl) {
      alert("Please enter all the data and upload a file");
      return null;
    } else if (price < 0) {
      alert("Please enter a valid price");
      return;
    } else if (isNaN(price)) {
      alert("Please enter a valid price");
      return;
    } else {
      /* first, upload to IPFS */
      const data = JSON.stringify({
        name,
        description,
        metadata: dataUrl,
        image: fileUrl
      })
      try {
        const added = await client.add(data)
        const url = `${gateway}/ipfs/${added.path}`
        /* after file is uploaded to IPFS, return the URL to use it in the transaction */
        return url
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
    }

  }

  async function listNFTForSale() {
    // setIsLoading(true);
    const url = await uploadToIPFS()
    if (url) {
      try {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        /* next, create the item */
        const price = ethers.utils.parseUnits(formInput.price, 'ether')
        let contract = new ethers.Contract(marketplaceAddress, Web3Marketplace.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()
        let transaction = await contract.createToken(url, price, {
          value: listingPrice
        })

        let marketItem = await transaction.wait()
        // setIsLoading(false);
        router.push('/')
      } catch (error) {
        console.error('error: ', error);
      }

    } else {
      console.log('invalid url... nothing to upload');
    }

  }

  return ( <div className = "bg-transparent flex justify-center">
    <div className = "w-1/2 flex flex-col pb-12">
    <input placeholder = "Give your Moment a Name" className = "mt-8 border rounded p-4"
      onChange = {e => updateFormInput({...formInput,name: e.target.value})}/>
    <textarea placeholder = "Add your Moments details" className = "mt-2 border rounded p-4"
    onChange = {e => updateFormInput({...formInput,description: e.target.value})}/>
    <textarea placeholder = "Some Highlights" className = "mt-2 border rounded p-4"
    onChange = {e => updateFormInput({...formInput,highlights: e.target.value })}/>
    <textarea placeholder = "Give your Moment a Tag Name  " className = "mt-2 border rounded p-4"
    onChange = {e => updateFormInput({...formInput,tags: e.target.value})}/>
    <input placeholder = "Price in ETH" className = "mt-2 border rounded p-4"
    onChange = {e => updateFormInput({...formInput,price: e.target.value})}/>
    <input type = "file" name = "Asset" className = "my-4"
      onChange = {onChange}/> {fileUrl && (
        <Image className = "rounded mt-4" alt="" width={350} height={300} src = {fileUrl}/>)}
    <button onClick = {listNFTForSale}
      className = "font-bold mt-4 bg-purple-800 text-white rounded p-4 shadow-lg">
      List Your Moment </button> </div> </div>
    )

} //end
