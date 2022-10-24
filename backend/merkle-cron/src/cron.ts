import gql from "graphql-tag";
import { NumericLiteral } from "typescript";

import { execute } from "../.graphclient";

// TODO:
// 1. query all props
// 2. query holders + delegates for a single prop
// 3. merkleize 2
// 4. stick stuff in postgres
// 5. cron schedule + idempotence

const testProposals = gql`
  query proposals {
    proposals(first: 1000) {
      id
    }
  }
`;

async function test() {
  const result = await execute(testProposals, {});
  console.log(result["data"]["proposals"]);

  console.log(`num proposals: ${result["data"]["proposals"].length}`);
}

// TODO: future proof against >1000 results per query

function buildDelegatesQuery(block: number, minDelegates: number) {
  return gql`query {
    delegates(first: 1000 block: { number: ${block} }, where: {delegatedVotes_gte: ${minDelegates}}) {
      id
      delegatedVotes
    }
  }`;
}

function buildOwnersQuery(block: number, minOwned: number) {
  return gql`query {
    accounts(first: 1000 block: { number: ${block} }, where: {tokenBalance_gte: ${minOwned}}) {
      id
      tokenBalance
    }
  }`;
}

// TODO: error handling for queries?
async function getAnonymitySet(
  block: number,
  minDelegates: number,
  minOwned: number
) {
  const delegatesRes = await execute(
    buildDelegatesQuery(block, minDelegates),
    {}
  );
  const delegates = delegatesRes["data"]["delegates"];
  console.log(delegates);

  const ownersRes = await execute(buildOwnersQuery(block, minOwned), {});
  const owners = ownersRes["data"]["accounts"];
  console.log(owners);
}

getAnonymitySet(15811106, 2, 2);

// TODO: merkleize
