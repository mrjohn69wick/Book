import './ProgressBar.css';

const ProgressBar = ({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress-container">
      <div className="progress-info">
        <span className="progress-label">التقدم</span>
        <span className="progress-stats">{completed} / {total}</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        >
          <span className="progress-percentage">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
