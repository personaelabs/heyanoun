import { useState, useRef } from "react";
import { Dialog } from "@headlessui/react";
import ReactMarkdown from "react-markdown";
import styles from "./Modal.module.css";

interface IModalProps {
  isOpen: boolean;
  handleClose: (isOpen: boolean) => void;
}

const fakeProposal = {
  id: "167",
  proposer: {
    id: "0xd1d1d4e36117ab794ec5d4c78cbd3a8904e691d0",
  },
  startBlock: "15891023",
  endBlock: "15927023",
  proposalThreshold: "1",
  quorumVotes: "74",
  description:
    "# Nouns Builder Protocol\n\n# Nouns Builder Protocol\n### Public Infrastructure brought to you by Zora and NounsDAO\n\n![](https://i.imgur.com/JycpSjR.png)\n\n**Mainnet Launch:** November 1st\n**Expected DAO Launch:** November 15th\n**Website:** [nouns.build](https://nouns.build)\n**Twitter:** [@nounsbuilder](http://twitter.com/nounsbuilder)\n\nLike you, we believe that Nouns DAO is a significant form factor innovation for NFTs and DAOs. Instead of giving all power and capital solely to a project’s founders, the Nouns model enables communities to emerge progressively, and to be active participants in how their brand and community evolves.\n\nWe believe that more Nouns forks should exist - so we’re building a tool anyone can use to build them.\n\nFor the past couple of months we have been working on the Nouns Builder: a product that makes it easy for anyone to create their own Nouns DAO with any art, any auction cadence and flexible DAOs that can evolve over time.\n\nAs we’ve been building this tool, we’ve increasingly realized that it makes sense to use this very tool to create a DAO that will govern, sustain and develop the Nouns Builder project itself. By doing so, Nouns builder can:\n* Demonstrate the utility of Nouns Builder as a public good\n* Utilize the ecosystem of tools in Nouns: Prop House, Agora\n* Experiment using the NounsDAO model as an alternative to the subDAO multisig\n* Experiment using the NounsDAO model to proliferate a protocol and products\n* Expand use of the NounsDAO model as a more effective governance model for collective decision making\n* Share governance of this DAO with Nouns, Zora, and future contributors as interested in expanding the horizon of this public infrastructure as we are. \n\nWe are going to call this DAO “Builder”, with its own art and NFT that will be minted each day. Builder will be NounsDAO from day 1, with the goal of proliferating this infrastructure.\n\n**Core details to note:**\n\n* Based on extensive feedback from the Nouns community, the protocol is entirely free. There is currently no protocol wide fee.\n* DAOs can opt in to gift a certain amount of their NFTs to Nouns or any other DAO or platform\n* In prior versions of the proposal, we proposed that NounsDAO would be the deployer of the Builder DAO. Based on feedback from the community we have removed this aspect of the proposal.\n* The protocol development has been extensive, with careful consideration made to\n    * Enable DAOs to easily upgrade and evolve themselves over time in a safe manner\n    * Be gas efficient\n    * Open up room for exploration around new distribution types like VRGDAs\n* The protocol has been audited via Code4rena, with Zora paying $129K USDC ($90k in prizes) to complete it.\n* We have built an easy to use tool at [nouns.build](https://nouns.build) where over 60 testnet DAOs have been created in the process of testing and refining the user experience.\n\n**Ask:**\n\n1000 ETH contribution to seed the Nouns Builder DAO treasury to help this public good reach its full potential. \n\n\n**Completed Work:**\n\nRather than requesting retroactive reward for development, ***we are asking NounsDAO to pay it forward* by seeding the Builder treasury with ETH** for funding the development of the Nouns Builder protocol as a public good and expansion of the ecosystem by the community. \n\nZora contributed ~4 months of development time on creating the Nouns Builder protocol\n* Full time contributions from the Zora solidity, backend, and front end engineering teams\n* Full time design and creative direction for Nouns Builder artworks.\n* ~100 ETH spent on the Code4rena audit.\n\nThis contribution to the Nouns Builder DAO treasury means there is sufficient Day 1 capital to immediately conduct prop house mandates and funding rounds for the development, proliferation, and accessibility of the protocol and ecosystem for the benefit of the public.\n\n**Deliverables:**\n* Audited Nouns Builder smart contracts.\n* Custom Nouns Builder generative artwork (CC0).\n* Builder DAO for anyone in the community to join and contribute.\n\n**All of the ETH will be going to the Nouns Builder DAO treasury.**\n\n**Builder DAO:**\n\nThe Builder DAO is created using the Nouns Builder tool and protocol. It is the entity onchain that will be responsible for funding the proliferation of the ecosystem and development of the protocol over time. \n\nWe believe Nouns Builder represents critical public infrastructure for community decision making, and we want to use the full power of the NounsDAO model to further this protocol and ecosystem of different apps built on top of it, as well as being able to natively tap into tools in the ecosystem like Prop House and Agora.\n\nBuilderDAO creators will receive the following governance rights in the Builder DAO for a period of 5 years after Builder DAO’s launch to allow the creators to support of the growth and development of this public good while in its nascency:\n* 1/10 to zora.eth\n* 1/20 to nouns.eth\n\nFor clarity, DAO members shall not receive any revenues from Builder DAO daily auctions. All funds in the Treasury shall be dedicated to improving the Builder DAO protocol and its public good function, and growing the community, brand, and ecosystem. \n\nThe Builder DAO will start with a daily auction. The NFTs that will be minted each day are a nounish artwork that expands on the ideas of “Internet flags”, a collection of unicode symbols that communities can organize around, with the nounish colors at its core, as well as the noggles.\n\nHere is a sample of the codex below:\n![](https://i.imgur.com/kArgmJn.png)\n\n\n**NounsDAOs for Public Infrastructure:**\n\nWe believe it is important to experiment with Nouns forks as a way to further particular pieces of infrastructure within the nounish ecosystem. Instead of funded LLCs and companies to ultimately manage tools like Nouns Builder and things like Prop House, we want to actively explore using a Nounish DAO as the primary entity to further a public protocol and an ecosystem of many platforms built on top of it. \n\nThis is why we are leading from the front with the Builder DAO. We are also optimistic that this can become a blueprint for any team that is developing protocols—like Zora itself. \n\n**Sustainability:**\n\nIn prior proposals there have been open questions around the future models for sustainability without need for persistent funding from NounsDAO all the time. We believe that this is the first meaningful step in this direction, and we hope to set a precedent and blueprint for future teams to build sustainable Public Infrastructure that is native to the Nouns ecosystem and DAO itself.\n\n**Transaction Details:**\n\n1000 ETH transferred to an escrow smart contract that will hold the funds until the Builder DAO is live and operational. We are expecting this to be live on approximately November 15th.\n\n**References:**\n[Discourse post](https://discourse.nouns.wtf/t/proposal-nouns-builder-draft/2007)\n[Prop house](https://discourse.nouns.wtf/t/prop-house-protocol-public-infrastructure-by-nouns-dao/1594)\n\n![](https://i.imgur.com/yPwwE6T.jpg)\n\n![](https://i.imgur.com/M31ZnVx.png)\n\n![](https://i.imgur.com/GLLYhTu.jpg)\n\n\n\n\n\n\n\n\n",
  status: "EXECUTED",
  executionETA: null,
};

const Modal: React.FC<IModalProps> = ({ isOpen, handleClose }) => {
  let completeButtonRef = useRef(null);

  const startVal = fakeProposal.description.indexOf("\n\n") + 2;
  const cleanedDescription = fakeProposal.description.slice(startVal);

  return (
    <Dialog
      open={isOpen}
      initialFocus={completeButtonRef}
      onClose={handleClose}
      className="relative z-50"
    >
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* This is the actual modal and it's contents */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-5xl bg-white">
            <div>
              <div className="px-12 py-10">
                <ReactMarkdown className={styles.markdown}>
                  {cleanedDescription}
                </ReactMarkdown>
              </div>
              <div className="bg-gray-50 border-t border-gray-200 p-6">
                This is the comments section
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
