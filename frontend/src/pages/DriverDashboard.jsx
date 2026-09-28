import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getMyVehicle,
} from "../features/vehicle/vehicle.service.js";
import {
  getMyPool,
  updatePoolStatus,
} from "../features/pool/pool.service.js";

const DriverDashboard = () => {
  const { user, logout } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [pool, setPool] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const vehicleResponse = await getMyVehicle();
      setVehicle(vehicleResponse.data);

      try {
        const poolResponse = await getMyPool();
        setPool(poolResponse.data);
      } catch (error) {
        if (error.message === "Pool not found") {
          setPool(null);
        } else {
          throw error;
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStatusChange = async (status) => {
    if (!pool) return;

    try {
      setActionLoading(true);
      setError("");

      const response = await updatePoolStatus(
        pool._id,
        status,
      );

      setPool(response.data);

      await loadDashboard();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <nav className="flex items-center justify-between bg-black px-6 py-4 text-white">
        <h1 className="text-xl font-bold">
          Tesla Ride Pooling
        </h1>

        <div className="flex items-center gap-4">
          <span>{user?.name}</span>

          <button
            onClick={logout}
            className="rounded-md bg-white px-4 py-2 text-sm text-black"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold">
          Driver Dashboard
        </h2>

        {error && (
          <p className="mb-6 rounded-md bg-red-100 p-3 text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* Vehicle */}
            {vehicle && (
              <div className="mb-6 rounded-xl bg-white p-6 shadow">
                <h3 className="mb-4 text-xl font-semibold">
                  My Vehicle
                </h3>

                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {vehicle.name}
                  </p>

                  <p>
                    <strong>Capacity:</strong>{" "}
                    {vehicle.capacity}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {vehicle.status}
                  </p>
                </div>
              </div>
            )}

            {/* Pool */}
            {pool ? (
              <div className="rounded-xl bg-white p-6 shadow">
                <h3 className="mb-4 text-xl font-semibold">
                  Current Pool
                </h3>

                <div className="space-y-2">
                  <p>
                    <strong>Pool Status:</strong>{" "}
                    {pool.status}
                  </p>

                  <p>
                    <strong>Occupied Seats:</strong>{" "}
                    {pool.occupiedSeats}
                  </p>

                  <p>
                    <strong>Total Capacity:</strong>{" "}
                    {pool.capacity}
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  {pool.status === "OPEN" && (
                    <button
                      onClick={() =>
                        handleStatusChange("IN_PROGRESS")
                      }
                      disabled={actionLoading}
                      className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Starting..."
                        : "Start Ride"}
                    </button>
                  )}

                  {pool.status === "IN_PROGRESS" && (
                    <button
                      onClick={() =>
                        handleStatusChange("COMPLETED")
                      }
                      disabled={actionLoading}
                      className="rounded-md bg-green-600 px-5 py-2 text-white disabled:opacity-50"
                    >
                      {actionLoading
                        ? "Completing..."
                        : "Complete Ride"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white p-6 shadow">
                <h3 className="mb-2 text-xl font-semibold">
                  No Active Pool
                </h3>

                <p className="text-gray-600">
                  There is currently no active ride pool.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DriverDashboard;