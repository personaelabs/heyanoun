import type { NextPage } from "next";
import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PropsPayload } from "../types/api";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ProposalRow from "../components/proposalRow";
import { extractTitle, getSubgraphProps } from "../utils/graphql";
import { motion } from "framer-motion";
import classnames from "classnames";
import { useBlockNumber } from "wagmi";
import { ProposalRowLoading } from "../components/proposalRowLoading";
import GeneralCommentWriter from "../components/generalCommentWriter";

const getDbProps = async () =>
  (await axios.get<PropsPayload>("/api/getProps")).data;

export interface DisplayProp {
  id: number;
  title: string;
  description: string; // in markdown format

  createdBlock: number;
  startBlock: number;
  endBlock: number;

  status: string;

  proposalThreshold: number;
  quorumVotes: number;

  executionETA: number | null;
}

const Home: NextPage = () => {
  const { data: currentBlockNumber } = useBlockNumber();
  const [tabState, setTabState] = useState(0);

  const { isLoading: propIdsLoading, data: propIdsPayload } =
    useQuery<PropsPayload>({
      queryKey: ["props"],
      queryFn: getDbProps,
      retry: 1,
      enabled: true,
      staleTime: 1000,
    });

  const { isLoading: propMetadataLoading, data: propMetadataPayload } =
    useQuery({
      queryKey: ["proposals"],
      queryFn: getSubgraphProps,
      retry: 1,
      enabled: true,
      staleTime: 1000,
    });

  const propsReverseOrder = useMemo(() => {
    const finalizedPropIds = new Set(
      propIdsPayload?.props.filter((p) => p.finalized).map((p) => p.num)
    );

    let finalizedPropMetadata: DisplayProp[] = propMetadataPayload?.proposals
      .filter((p: any) => finalizedPropIds.has(Number(p.id)))
      .map((p: any) => {
        // NOTE: may want to extract this out later
        return {
          ...p,
          id: Number(p.id),

          createdBlock: Number(p.createdBlock),
          startBlock: Number(p.startBlock),
          endBlock: Number(p.endBlock),
          executionETA: p.executionETA ? Number(p.executionETA) : null,

          proposalThreshold: Number(p.proposalThreshold),
          quorumVotes: Number(p.quorumVotes),

          title: extractTitle(p.description),
        };
      });

    if (finalizedPropMetadata) {
      return finalizedPropMetadata
        .slice(0)
        .sort((a: any, b: any) => b.id - a.id);
    } else {
      return [];
    }
  }, [propIdsPayload?.props, propMetadataPayload?.proposals]);

  return (
    <div>
      <Head>
        <title>Heyanoun</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="bg-black dots">
          <div className="pt-8">
            <nav className="pr-6 flex justify-end">
              <ConnectButton />
            </nav>
            <div className="max-w-7xl mx-auto pt-12 pb-8 px-4 sm:px-6 lg:px-8">
              <div className="text-center md:text-center max-w-2xl mx-auto">
                <motion.h1
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl md:text-5xl text-white font-bold leading-[40px] md:leading-14"
                >
                  Give Feedback On Proposals Anonymously
                </motion.h1>
                <motion.p
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mt-4 text-lg md:text-xl font-normal md:leading-8 text-white"
                >
                  Anoun allows noun-holders to give feedback on proposals while
                  maintaining their privacy using zero-knowledge proofs.{" "}
                </motion.p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-40" src="nouns.png" alt="nouns" />
          </div>
        </div>

        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-3xl mx-auto py-5 md:py-10 px-3 md:px-0">
            <div className="flex space-x-2">
              <button
                type="button"
                className={classnames(
                  "font-semi-bold items-center rounded-md border border-transparent bg-gray-50 px-4 py-2 font-medium text-gray-800 hover:bg-gray-100 text-xl transition-all ",
                  {
                    "bg-gray-100": tabState === 0,
                  }
                )}
                onClick={() => {
                  setTabState(0);
                }}
              >
                Proposals
              </button>
              <button
                type="button"
                className={classnames(
                  "font-semi-bold items-center rounded-md border border-transparent bg-gray-50 px-4 py-2 font-medium text-gray-800 hover:bg-gray-100 text-xl transition-all",
                  {
                    "bg-gray-100": tabState === 1,
                  }
                )}
                onClick={() => {
                  setTabState(1);
                }}
              >
                General
              </button>
            </div>
            <div className="mt-6">
              {tabState === 0 && (
                <>
                  {propIdsLoading ||
                  propMetadataLoading ||
                  propsReverseOrder == undefined ? (
                    <ProposalRowLoading count={12} />
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {propsReverseOrder &&
                        propsReverseOrder.map((prop: DisplayProp) => {
                          return (
                            <div key={prop.id}>
                              <ProposalRow
                                prop={prop}
                                currentBlockNumber={currentBlockNumber}
                              />
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              )}

              {tabState === 1 && (
                <>
                  <h2 className="ml-2 mb-4 text-xl font-semibold text-gray-800">
                    What comments do you have about the DAO generally?
                  </h2>
                  <GeneralCommentWriter propId={1} />{" "}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>
        {`
          .dots {
            background-image: radial-gradient(#1c1e2b 1px, transparent 0);
            background-size: 13px 13px;
            background-position: 0px 0px;
          }
        `}
      </style>
    </div>
  );
};

export default Home;
