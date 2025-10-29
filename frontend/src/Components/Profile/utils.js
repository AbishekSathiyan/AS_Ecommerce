// Components/Profile/util.js

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
    case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
    case "delivered": return "bg-green-100 text-green-800 border-green-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
