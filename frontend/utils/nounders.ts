// NOTE: `getOwners` from nounders DAO 0x2573C60a6D127755aA2DC85e342F7da2378a0Cc5
export const nounderAddresses = [
  "0x6223bc5fd16a19bcfae2281dde47861cfe1023ee",
  "0xe8ce6c8e37c61b6b77419eebd661112c21a3aff8",
  "0xfc9e8db5e255439f430e058462360dd52b87cb4f",
  "0x83fcfe8ba2fece9578f0bbafed4ebf5e915045b9",
  "0x87757c7fd54d892176e9ecec6767bc16e04a06a8",
  "0x88f9e324801320a3fc22c8d045a98ad32a490d8e",
  "0xb1c41c71d36cedea7ddcd5f8d5c5c32ba8f3cbfc",
  "0xe26d78c6bff297bbc2da3f80fea9a42028a4260f",
];

export const noundersGroupId = -1;

export function buildNoundersGroupWithType(propId: number) {
  return {
    groupId: noundersGroupId,
    propId,
    type: "nounders",
  };
}
