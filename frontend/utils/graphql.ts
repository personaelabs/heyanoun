import { request, gql, GraphQLClient } from "graphql-request";

// TODO: future proof against >1000 total props
const allPropsQuery = gql`
  query {
    proposals(first: 1000, orderBy: createdBlock) {
      id
      description

      createdBlock

      startBlock
      endBlock

      proposalThreshold
      quorumVotes

      status

      executionETA
    }
  }
`;

const subgraphURL =
  "https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph";

const client = new GraphQLClient(subgraphURL, { headers: {} });

export async function getSubgraphProps() {
  const data = await client.request(allPropsQuery);
  return data;
}

export function extractTitle(description: string) {
  const headerRE = /# .*/g;

  const matches = description.match(headerRE) || [""];

  return matches[0].slice(2);
}
