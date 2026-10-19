// ErrorMessage Component
// Displays user-friendly error details and a retry button
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <h3>Failed to Load Repositories</h3>
      <p>{message || 'An error occurred while connecting to the GitHub API.'}</p>
      {onRetry && (
        <button type="button" className="btn-retry" onClick={onRetry}>
          ↻ Retry Request
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
