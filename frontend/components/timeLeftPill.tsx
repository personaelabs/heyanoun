const TimeLeftPill: React.FC<{ timeLeft: string | undefined }> = props => {
  const { timeLeft } = props;

  return (
    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
      {timeLeft}
    </span>
  );
};

export default TimeLeftPill;
