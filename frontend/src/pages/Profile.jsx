import React from "react";
import "../css/Profile.css";

const Profile = ({ user, posts }) => {
  return (
    <div className="profile-container">
      <h1 className="profile-title">User: {user.name}</h1>
      <p>Username: {user.username}</p>
      <p>Email: {user.email}</p>

      {user.profilePic && (
        <img
          src={user.profilePic}
          alt="Profile"
          className="profile-pic"
        />
      )}

      <form className="post-form">
        <textarea
          name="content"
          placeholder="Write your post here..."
          required
        ></textarea>
        <button type="submit">Submit Post</button>
      </form>

      <h2 className="section-title">My Posts:</h2>
      <div className="posts">
        {posts.map((post) => (
          <div className="post-card" key={post._id}>
            <div className="post-header">
              <strong>{post.sender}</strong>
              <button className="delete-btn">Delete</button>
            </div>
            <p>{post.content}</p>
            <h5>
              Likes: <strong>{post.likes}</strong>
            </h5>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;