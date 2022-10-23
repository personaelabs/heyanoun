import gql from "graphql-tag";

import { execute } from "../.graphclient";

const testProposals = gql`
  query proposals {
    proposals(orderBy: id, orderDirection: desc) {
      id
    }
  }
`;

async function main() {
  const result = await execute(testProposals, {});
  console.log(result["data"]["proposals"]);

  console.log(`num proposals: ${result["data"]["proposals"].length}`);
}

main();
