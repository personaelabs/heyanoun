import classnames from "classnames";

export enum NounSet {
  Nounder,
  SingleNoun,
  ManyNouns,
}

export const nounSetToDbType = (nounSet: NounSet): string => {
  switch (nounSet) {
    case NounSet.Nounder:
      return "nounders";
    case NounSet.SingleNoun:
      return "1-noun";
    case NounSet.ManyNouns:
      return "2-noun";
  }
};

interface IAnonPill {
  isActive?: boolean;
  nounSet: NounSet;
}

const AnonPill: React.FC<IAnonPill> = ({
  isActive = true,
  nounSet = NounSet.ManyNouns,
}) => {
  let nounSVGPath;
  let tagName;
  if (nounSet === NounSet.Nounder) {
    tagName = `Nounder`;
    nounSVGPath = `/pseudo-noun-purple.svg`;
  }
  if (nounSet === NounSet.ManyNouns) {
    tagName = `>2 nouns`;
    nounSVGPath = `/pseudo-noun-green.svg`;
  }
  if (nounSet === NounSet.SingleNoun) {
    tagName = `noun holder`;
    nounSVGPath = `/pseudo-noun-red.svg`;
  }

  if (!isActive) {
    nounSVGPath = `/pseudo-noun-green.svg`;
  }

  return (
    <div
      className={classnames(
        "hover:cursor-pointer border rounded-2xl p-[2px] flex items-center",
        {
          "bg-purple-50 border-purple-100":
            NounSet.Nounder === nounSet && isActive,
          "bg-green-50 border-green-100":
            NounSet.ManyNouns === nounSet && isActive,
          "bg-pink-50 border-pink-100":
            NounSet.SingleNoun === nounSet && isActive,
          "bg-gray-100 border-gray-200": !isActive,
        }
      )}
    >
      <div
        className={classnames(
          "rounded-full w-7 h-7 flex items-center justify-center",
          {
            "bg-purple-100": nounSet === NounSet.Nounder && isActive,
            "bg-green-100": nounSet === NounSet.ManyNouns && isActive,
            "bg-pink-100": nounSet === NounSet.SingleNoun && isActive,
            "bg-gray-200 grayscale": !isActive,
          }
        )}
      >
        {/* Not easy to replac this img tag */}
        <img className="max-w-[70px] mt-[10px] mr-[1px]" src={nounSVGPath} />
      </div>
      <div
        className={classnames(
          "font-bold text-[11px] uppercase px-2 flex items-center tracking-wider max-h-5 mt-[2px]",
          {
            "text-purple-900": NounSet.Nounder === nounSet && isActive,
            "text-green-900": NounSet.ManyNouns === nounSet && isActive,
            "text-pink-900": NounSet.SingleNoun === nounSet && isActive,
            "text-gray-600 grayscale": !isActive,
          }
        )}
      >
        {tagName}
      </div>
    </div>
  );
};

export default AnonPill;
