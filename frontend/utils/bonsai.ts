import { providers } from 'ethers';
import { BonsaiResponse } from '../types/api';

export async function fetchBonsaiProof(tx: providers.TransactionResponse): Promise<BonsaiResponse> {
  const url = process.env.BONSAI_API_URL;

  if (url === undefined) {
    throw new Error('BONSAI_API_URL is undefined');
  }

  const data = {
    transaction: tx,
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) // Convert the JavaScript object to a JSON string
  };
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Bonsai API failed. status: ${response.status}`);
  }

  const bonsaiData = await response.json();
  return {
    proof: bonsaiData.proof,
    from: bonsaiData.from,
    to: bonsaiData.to,
    root: bonsaiData.root
  }
}
