import gql from "graphql-tag";

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

async function main() {
  const result = await execute(testProposals, {});
  console.log(result["data"]["proposals"]);

  console.log(`num proposals: ${result["data"]["proposals"].length}`);
}

main();
