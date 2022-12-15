interface IProposalStatusProps {
  status: string;
  isDefeated: boolean;
}

const ProposalStatusPill: React.FC<IProposalStatusProps> = ({
  status,
  isDefeated,
}) => {

  const getStatusPillColor = (status: string,) => {
    if (isDefeated) return 'bg-red-100 text-red-800';

    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'QUEUED':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXECUTED':
        return 'bg-blue-100 text-blue-800';
      case 'VETOED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${getStatusPillColor(status)}`}>
      {status}
    </span>
  );
};

export default ProposalStatusPill;
