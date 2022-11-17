import { request, gql, GraphQLClient } from "graphql-request";

// TODO: future proof against >1000 total props
const allPropsQuery = gql`
  query {
    proposals(first: 1000, orderBy: createdBlock) {
      id
      description
      createdBlock
      executionETA
    }
  }
`;

const subgraphURL =
  "https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph";

const client = new GraphQLClient(subgraphURL, { headers: {} });

export async function getSubgraphProps() {
  const data = await client.request(allPropsQuery);

  // TODO: remoev!
  console.log(data);
  return data.proposals;
}
