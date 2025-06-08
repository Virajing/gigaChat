import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Dashboard.css'; // keep using your existing CSS

const Dashboard = () => {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/dashboard', {
          withCredentials: true,
        });

        if (typeof response.data !== 'object') {
          setError('You are not logged in. Redirecting to login...');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }

        const data = response.data.posts;
        if (!Array.isArray(data)) {
          setError('Invalid response from server.');
        } else {
          setPosts(data);
        }
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Something went wrong. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };

    fetchPosts();
  }, []);

  if (error) {
    return <div className="centered-message">{error}</div>;
  }

  if (posts === null) {
    return <div className="centered-message">Loading...</div>;
  }

  return (
    <div className="dashboard-feed">
      <h1 className="feed-title">📸 Feed</h1>
      {posts.length === 0 ? (
        <p className="no-posts">No posts available.</p>
      ) : (
        posts.map((post, index) => (
          <div key={index} className="feed-post">
            <div className="feed-header">
              {post.profilePic && (
                <img
                  src={post.profilePic}
                  alt="Profile"
                  className="feed-avatar"
                />
              )}
              <span className="feed-username">{post.sender}</span>
            </div>
            <div className="feed-content">
              <p>{post.content}</p>
            </div>
            <div className="feed-footer">
              <span>❤️ {post.likes || 0} Likes</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
