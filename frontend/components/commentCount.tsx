const CommentCount: React.FC<{ count: number }> = props => {
  const { count } = props;

  return (
    <span className="text-xs font-bold italic text-gray-500 self-center tracking-tight">
      {count} {count === 1 ? "comment" : "comments"}
    </span>
  );
};

export default CommentCount;
