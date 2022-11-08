import { DocumentNode } from "graphql";
import gql from "graphql-tag";

import { execute } from "../.graphclient";

// TODO: future proof against >1000 total props
function buildPropsQuery() {
  return gql`
    query {
      proposals(first: 1000, orderBy: createdBlock) {
        id
        createdBlock
      }
    }
  `;
}

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

// TODO: error handling
async function executeQuery(query: DocumentNode) {
  const res = await execute(query, {});
  return res["data"];
}

export { buildPropsQuery, buildDelegatesQuery, buildOwnersQuery, executeQuery };
