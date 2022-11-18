interface Props {
  onClickHandler?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  color: string;
  backgroundColor: string;
}

export const Button = ({
  onClickHandler,
  children,
  color,
  backgroundColor,
}: Props) => {
  return (
    <button
      onClick={onClickHandler}
      style={{ color, backgroundColor }}
      className="py-2 px-4 rounded-md"
    >
      {children}
    </button>
  );
};
