import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createRideRequest,
  getMyRideRequests,
  cancelRideRequest,
} from "../features/ride/ride.service.js";

const PassengerDashboard = () => {
  const { user, logout } = useAuth();

  const [destinationArea, setDestinationArea] = useState("Mohakhali");
  const [requestedSeats, setRequestedSeats] = useState(1);

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rideLoading, setRideLoading] = useState(true);
  const [error, setError] = useState("");

  const [rideHistory, setRideHistory] = useState([]);

  const loadMyRide = async () => {
    try {
      setError("");

      const response = await getMyRideRequests();

      const rides = response.data || [];

      setRideHistory(rides);

      const activeRide = rides.find(
        (item) =>
          item.status === "WAITING" ||
          item.status === "MATCHED" ||
          item.status === "IN_PROGRESS",
      );

      setRide(activeRide || null);
    } catch (error) {
      setError(error.message);
    } finally {
      setRideLoading(false);
    }
  };

  useEffect(() => {
    loadMyRide();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await createRideRequest({
        pickupArea: "Banani",
        destinationArea,
        requestedSeats: Number(requestedSeats),
      });

      setRide(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!ride) return;

    setError("");

    try {
      await cancelRideRequest(ride._id);
      setRide(null);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between bg-black px-6 py-4 text-white">
        <h1 className="text-xl font-bold">Tesla Ride Pooling</h1>

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
        <h2 className="mb-6 text-2xl font-bold">Passenger Dashboard</h2>

        {error && (
          <p className="mb-6 rounded-md bg-red-100 p-3 text-red-600">{error}</p>
        )}

        {rideLoading ? (
          <p>Loading...</p>
        ) : ride ? (
          <div className="mb-8 rounded-xl bg-white p-6 shadow">
            <h3 className="mb-4 text-xl font-semibold">Your Current Ride</h3>

            <div className="space-y-2">
              <p>
                <strong>Pickup:</strong> {ride.pickupArea}
              </p>

              <p>
                <strong>Destination:</strong> {ride.destinationArea}
              </p>

              <p>
                <strong>Seats:</strong> {ride.requestedSeats}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className="font-semibold">{ride.status}</span>
              </p>

              {ride.farePaisa !== null && (
                <p>
                  <strong>Fare:</strong> {(ride.farePaisa / 100).toFixed(2)} BDT
                </p>
              )}
            </div>

            {(ride.status === "WAITING" || ride.status === "MATCHED") && (
              <button
                onClick={handleCancel}
                className="mt-6 rounded-md bg-red-600 px-5 py-2 text-white hover:bg-red-700"
              >
                Cancel Ride
              </button>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-white p-6 shadow"
          >
            <h3 className="mb-6 text-xl font-semibold">Request a Ride</h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                Pickup Area
              </label>

              <input
                value="Banani"
                disabled
                className="w-full rounded-md border bg-gray-100 px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                Destination
              </label>

              <select
                value={destinationArea}
                onChange={(event) => setDestinationArea(event.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="Mohakhali">Mohakhali</option>
                <option value="Gulshan 1">Gulshan 1</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium">Seats</label>

              <select
                value={requestedSeats}
                onChange={(event) => setRequestedSeats(event.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-black py-2.5 text-white disabled:opacity-50"
            >
              {loading ? "Requesting..." : "Request Ride"}
            </button>
          </form>
        )}
      </main>
      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h3 className="mb-4 text-xl font-semibold">Ride History</h3>

        {rideHistory.length === 0 ? (
          <p className="text-gray-500">No ride history yet.</p>
        ) : (
          <div className="space-y-3">
            {rideHistory.map((item) => (
              <div key={item._id} className="rounded-lg border p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {item.pickupArea} → {item.destinationArea}
                    </p>

                    <p className="text-sm text-gray-500">
                      Seats: {item.requestedSeats}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {item.farePaisa !== null
                        ? `${(item.farePaisa / 100).toFixed(2)} BDT`
                        : "N/A"}
                    </p>

                    <p className="text-sm">{item.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerDashboard;
