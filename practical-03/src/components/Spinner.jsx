// Spinner Component
// Displays animated CSS loading indicator during asynchronous API calls
function Spinner() {
  return (
    <div className="spinner-container">
      <div className="basic-spinner"></div>
      <p>Loading repositories from GitHub REST API...</p>
    </div>
  );
}

export default Spinner;
