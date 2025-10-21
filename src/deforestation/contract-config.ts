require('dotenv').config();

export const contractAddress = process.env.CONTRACT_ADDRESS;
export const INFURA_API_KEY = process.env.INFURA_API_KEY;
export const CONTRACT_NEWTORK = process.env.CONTRACT_NEWTORK;
export const OWNER_PUBLIC_KEY = process.env.OWNER_PUBLIC_KEY;
export const COMMITTERS_PUBLIC_KEY = process.env.COMMITTERS_PUBLIC_KEY;
export const COMMITTERS_PRIVATE_KEY = process.env.COMMITTERS_PRIVATE_KEY;
export const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
export const ETHER_SCAN = process.env.ETHER_SCAN;
export const JSON_RPC_URL = process.env.JSON_RPC_URL;
export const BALANCE_THRESHOLD = process.env.BALANCE_THRESHOLD;
export const SLACK_URL = process.env.SLACK_URL;

export const contractABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'serializedReportData',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'hashSerializedReportData',
        type: 'bytes32',
      },
    ],
    name: 'HashEvent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    inputs: [],
    name: 'count',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'fetchSerializedReportData',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'serializedReportData',
        type: 'string',
      },
    ],
    name: 'mapSerializedReportData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
