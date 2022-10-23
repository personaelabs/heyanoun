import gql from "graphql-tag";

import { execute } from "../.graphclient";

const testProposals = gql`
  query proposals {
    proposals(orderBy: startBlock, orderDirection: desc) {
      id
      proposer {
        id
      }
    }
  }
`;

async function main() {
  const result = await execute(testProposals, {});
  console.log(result["data"]["proposals"]);
}

main();
