import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_CONTACTS = `${API_BASE}/contact`;

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching contacts from:", API_CONTACTS);
      const res = await axios.get(API_CONTACTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to fetch contacts",
        text: err.response?.data?.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This contact message will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const url = `${API_CONTACTS}/${contactId}`;
        console.log("Delete URL:", url);

        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setContacts(contacts.filter((contact) => contact._id !== contactId));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Contact message has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire({
          icon: "error",
          title: "Delete failed",
          text: err.response?.data?.message || "Failed to delete contact",
        });
      }
    }
  };

  const handleMarkAsRead = async (contactId) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${API_CONTACTS}/${contactId}`;
      console.log("Mark as read URL:", url);

      // First try PATCH
      let response;
      try {
        response = await axios.patch(
          url,
          { read: true },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        console.log("PATCH successful:", response.data);
      } catch (patchError) {
        console.log("PATCH failed, trying PUT...");
        // If PATCH fails, try PUT
        response = await axios.put(
          url,
          { read: true },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        console.log("PUT successful:", response.data);
      }

      if (response.data.success) {
        setContacts(
          contacts.map((contact) =>
            contact._id === contactId ? { ...contact, read: true } : contact
          )
        );

        if (selectedContact?._id === contactId) {
          setSelectedContact({ ...selectedContact, read: true });
        }

        Swal.fire({
          icon: "success",
          title: "Marked as read",
          text: "Message has been marked as read.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Mark as read error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });

      const errorMessage =
        err.response?.data?.error || err.message || "Failed to mark as read";
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: errorMessage,
      });
    }
  };

  const handleMarkAsUnread = async (contactId) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${API_CONTACTS}/${contactId}`;
      console.log("Mark as unread URL:", url);

      // First try PATCH
      let response;
      try {
        response = await axios.patch(
          url,
          { read: false },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        console.log("PATCH successful:", response.data);
      } catch (patchError) {
        console.log("PATCH failed, trying PUT...");
        response = await axios.put(
          url,
          { read: false },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        console.log("PUT successful:", response.data);
      }

      if (response.data.success) {
        setContacts(
          contacts.map((contact) =>
            contact._id === contactId ? { ...contact, read: false } : contact
          )
        );

        if (selectedContact?._id === contactId) {
          setSelectedContact({ ...selectedContact, read: false });
        }

        Swal.fire({
          icon: "success",
          title: "Marked as unread",
          text: "Message has been marked as unread.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Mark as unread error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });

      const errorMessage =
        err.response?.data?.error || err.message || "Failed to mark as unread";
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: errorMessage,
      });
    }
  };

  const handleStatusUpdate = async (contactId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${API_CONTACTS}/${contactId}`;
      console.log("Status update URL:", url);
      console.log("New status:", newStatus);

      // First try PATCH
      let response;
      try {
        response = await axios.patch(
          url,
          { status: newStatus },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        console.log("PATCH successful:", response.data);
      } catch (patchError) {
        console.log("PATCH failed, trying PUT...");
        response = await axios.put(
          url,
          { status: newStatus },
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        console.log("PUT successful:", response.data);
      }

      if (response.data.success) {
        setContacts(
          contacts.map((contact) =>
            contact._id === contactId
              ? { ...contact, status: newStatus }
              : contact
          )
        );

        if (selectedContact?._id === contactId) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }

        Swal.fire({
          icon: "success",
          title: "Status updated!",
          text: `Message marked as ${newStatus}`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });

      const errorMessage =
        err.response?.data?.error || err.message || "Failed to update status";
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: errorMessage,
      });
    }
  };

  const handleBulkDelete = async () => {
    const selectedContacts = filteredContacts.filter(
      (contact) => contact.selected
    );

    if (selectedContacts.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No messages selected",
        text: "Please select messages to delete.",
      });
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${selectedContacts.length} messages?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, delete ${selectedContacts.length} messages!`,
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const deletePromises = selectedContacts.map((contact) =>
          axios.delete(`${API_CONTACTS}/${contact._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        await Promise.all(deletePromises);

        const deletedIds = selectedContacts.map((contact) => contact._id);
        setContacts(
          contacts.filter((contact) => !deletedIds.includes(contact._id))
        );

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `${selectedContacts.length} messages have been deleted.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Delete failed",
          text: err.response?.data?.message || "Failed to delete messages",
        });
      }
    }
  };

  const handleSelectAll = (checked) => {
    setContacts(
      contacts.map((contact) => ({
        ...contact,
        selected: checked,
      }))
    );
  };

  const handleSelectContact = (contactId, checked) => {
    setContacts(
      contacts.map((contact) =>
        contact._id === contactId ? { ...contact, selected: checked } : contact
      )
    );
  };

  // Filter and sort contacts
  const filteredContacts = contacts
    .filter((contact) => {
      const matchesSearch =
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unread" && !contact.read) ||
        (statusFilter === "read" && contact.read);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  // Calculate counts
  const unreadCount = contacts.filter((contact) => !contact.read).length;
  const selectedCount = filteredContacts.filter(
    (contact) => contact.selected
  ).length;

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 text-lg mt-4">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="header bg-gradient-to-r from-gray-900 to-gray-800 text-white flex justify-between items-center py-4 px-6 shadow-md">
        {/* Logo + Title */}
        <div className="flex items-center space-x-3">
          <img
            src="/Logo.jpg"
            alt="AS Ecommerce Logo"
            className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow-sm"
          />
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">
            AS <span className="text-yellow-400">Ecommerce</span> Admin
          </h1>
        </div>

        {/* Right Side (Optional) */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Contact Messages
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and review customer inquiries and feedback
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {unreadCount} unread
              </span>
              <button
                onClick={() =>
                  setViewMode(viewMode === "list" ? "grid" : "list")
                }
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {viewMode === "list" ? "Grid View" : "List View"}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, message, or ticket number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">
                {selectedCount} message{selectedCount !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No contact messages
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No messages match your current filters."
                : "Get started by collecting customer feedback."}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    filteredContacts.length > 0 &&
                    filteredContacts.every((contact) => contact.selected)
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Select all</span>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <li
                  key={contact._id}
                  className={`p-6 hover:bg-gray-50 transition-colors duration-150 ${
                    !contact.read
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={contact.selected || false}
                        onChange={(e) =>
                          handleSelectContact(contact._id, e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {contact.name}
                          </h3>
                          {!contact.read && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                          {contact.status && (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                contact.status
                              )}`}
                            >
                              {contact.status}
                            </span>
                          )}
                          {contact.ticketNumber && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              #{contact.ticketNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {contact.email}
                        </p>
                        <p className="text-gray-700 line-clamp-2 mb-3">
                          {contact.message}
                        </p>
                        {contact.createdAt && (
                          <p className="text-xs text-gray-500">
                            Received{" "}
                            {new Date(contact.createdAt).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(contact.createdAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
                      {contact.read ? (
                        <button
                          onClick={() => handleMarkAsUnread(contact._id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          title="Mark as unread"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Unread
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsRead(contact._id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          title="Mark as read"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Read
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact._id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-200 ${
                  !contact.read
                    ? "border-l-4 border-l-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      {!contact.read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {contact.email}
                    </p>
                    {contact.ticketNumber && (
                      <p className="text-xs text-gray-500 mb-2">
                        Ticket: #{contact.ticketNumber}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {contact.message}
                </p>

                {contact.status && (
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        contact.status
                      )}`}
                    >
                      {contact.status}
                    </span>
                  </div>
                )}

                {contact.createdAt && (
                  <p className="text-xs text-gray-500 mb-4">
                    {new Date(contact.createdAt).toLocaleDateString()} •{" "}
                    {new Date(contact.createdAt).toLocaleTimeString()}
                  </p>
                )}

                <div className="flex space-x-2">
                  {contact.read ? (
                    <button
                      onClick={() => handleMarkAsUnread(contact._id)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Mark Unread
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkAsRead(contact._id)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedContact(contact)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Contact Details
                </h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <p className="text-lg text-gray-900 font-semibold">
                      {selectedContact.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-lg text-gray-900">
                      {selectedContact.email}
                    </p>
                  </div>

                  {selectedContact.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-lg text-gray-900">
                        {selectedContact.phone}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedContact.ticketNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ticket Number
                      </label>
                      <p className="text-lg text-gray-900 font-mono">
                        #{selectedContact.ticketNumber}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedContact.status
                        )}`}
                      >
                        {selectedContact.status || "new"}
                      </span>
                      <select
                        value={selectedContact.status || "new"}
                        onChange={(e) =>
                          handleStatusUpdate(
                            selectedContact._id,
                            e.target.value
                          )
                        }
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {selectedContact.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Received
                      </label>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedContact.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                {selectedContact.read ? (
                  <button
                    onClick={() => {
                      handleMarkAsUnread(selectedContact._id);
                      setSelectedContact({ ...selectedContact, read: false });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Mark as Unread
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedContact._id);
                      setSelectedContact({ ...selectedContact, read: true });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}

                <a
                  href={`mailto:${
                    selectedContact.email
                  }?subject=Re: ${encodeURIComponent(
                    selectedContact.subject || "Your inquiry"
                  )}&body=Dear ${encodeURIComponent(selectedContact.name)},`}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Reply via Email
                </a>

                <button
                  onClick={() => handleDeleteContact(selectedContact._id)}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Delete Message
                </button>

                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContacts;
