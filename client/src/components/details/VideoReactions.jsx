import { useVideoReaction } from '../../../Hooks/videoPosts/useVideoPostInteractions';
import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

/**
 * A reusable like/reaction button.
 *
 * Props:
 * - postId: ID of the post to react to
 * - reactions: array of reaction objects [{ like, unlike, post_reacter_id, ... }]
 * - profileId: current user's profile ID
 */
const ReactionButton = ({ postId, reactions = [], profileId }) => {

  console.log(profileId, reactions);
  
  // Derive initial state from reactions array
  const initialLikeCount = reactions.filter(r => r.like).length;
  const initialLiked = reactions.some(
    r => r.post_reacter_id === profileId && r.like
  );


  console.log(reactions, initialLiked, initialLikeCount);

  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const { reactToVideo, loading, error } = useVideoReaction();

  console.log(error);
  

  // Sync if reactions or profileId change
 useEffect(() => {
     setIsLiked(initialLiked);
     setLikeCount(initialLikeCount);
   }, [initialLiked, initialLikeCount]);

  
  const handleClick = async (e) => {
    e.stopPropagation();
    // Optimistic UI update
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(count => count - 1);
      await reactToVideo(postId, false, true);
    } else {
      setIsLiked(true);
      setLikeCount(count => count + 1);
      await reactToVideo(postId, true, false);
    }
  };


  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-gray-100 flex justify-center items-center gap-2 px-4 py-2 rounded-full shadow-md hover:bg-red-300 transition-all duration-200"
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      {isLiked ? (
        <FaHeart className="text-green-700" />
      ) : (
        <FaRegHeart className="text-gray-500" />
      )}
      <span className="text-sm text-gray-700">{likeCount}</span>
    </button>
  );
};

export default ReactionButton;
