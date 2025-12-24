import React, { useState, useEffect, useRef } from 'react';
import { useCreateVideoComment } from '../../../Hooks/videoPosts/useVideoPostInteractions';
import { FaComment, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useProfile from '../../../Hooks/useProfile';

const CommentModal = ({ comments: initialComments, postId, ...props }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(() =>
    Array.isArray(initialComments) ? initialComments : []
  );
  const commentsEndRef = useRef(null);

  const { createComment, isLoading, error } = useCreateVideoComment();
  const { profile } = useProfile();

  // Sync comments when prop updates, but preserve our optimistic ones
  useEffect(() => {
    if (Array.isArray(initialComments)) {
      // Keep our local comments that aren't in the server data
      const localOnlyComments = comments.filter(
        localComment => !initialComments.some(
          serverComment => serverComment.id === localComment.id
        )
      );

      // Combine server data with local-only comments
      setComments([...initialComments, ...localOnlyComments]);
    }
  }, [initialComments]);

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Submit new comment with optimistic UI
  const handleSubmitComment = async e => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    // Generate a temporary ID for the optimistic comment
    const tempId = `temp-${Date.now()}`;

    // Create optimistic comment object
    const tempComment = {
      id: tempId,
      username: profile?.username || 'You',
      profile_picture: profile?.image || '/default-profile.jpg',
      comment: trimmedComment,
      created_at: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      isOptimistic: true // Flag to identify our local comments
    };

    // Add comment to UI immediately
    setComments(prev => [...prev, tempComment]);
    setNewComment(''); // Clear input field

    // Scroll to the new comment
    scrollToBottom();

    // Now attempt to send to server, but don't update our UI on success
    try {
      await createComment(postId, trimmedComment);
      // Don't do anything with the response - we want to keep our optimistic UI
    } catch (err) {
      // Mark as failed but keep it visible
      setComments(prev => prev.map(c =>
        c.id === tempId
          ? { ...c, isFailed: true }
          : c
      ));
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // Generate a safe key for React lists
  const generateSafeKey = (comment, index) => {
    if (comment.id) return `comment-${comment.id}`;
    return `comment-index-${index}`;
  };

  return (
    <>
      {/* Comment Trigger */}
      {/* If children are provided, use them as the trigger. Otherwise use default button. */}
      {props.children ? (
        <div onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}>
          {props.children}
        </div>
      ) : (
        <button
          onClick={e => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="flex flex-col items-center rounded-full"
          style={{ color: 'var(--color-text-primary)' }}
          aria-label="View comments"
        >
          <div
            className="rounded-full p-2 transition-colors"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <FaComment className="text-xl" />
          </div>
          <span className="text-sm">{comments.length}</span>
        </button>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[0]">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ backgroundColor: 'var(--color-backdrop)' }}
              onClick={() => setIsModalOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Modal Panel */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden flex flex-col shadow-2xl"
              style={{
                height: '75vh',
                backgroundColor: 'var(--color-bg-primary)',
                borderTop: '1px solid var(--color-border)',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
              }}
              onClick={e => e.stopPropagation()} // Stop backdrop click
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div
                className="px-6 py-4 flex justify-between items-center bg-opacity-95 backdrop-blur-sm z-10"
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}
              >
                <h3
                  className="font-bold text-lg"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {comments.length} comments
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                  aria-label="Close comments"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto px-4 touch-pan-y overscroll-contain">
                <div className="space-y-5 py-4">
                  {comments.length ? (
                    comments.map((comment, index) => (
                      <motion.div
                        key={generateSafeKey(comment, index)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 items-start"
                      >
                        <img
                          src={comment.profile_picture}
                          alt="Profile"
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-100 dark:border-gray-800"
                          onError={e => e.target.src = '/default-profile.jpg'}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`rounded-2xl px-4 py-3 ${comment.isFailed ? 'border border-red-300' : ''}`}
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: comment.isFailed ? 'var(--color-error)' : 'transparent'
                            }}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p
                                className="font-bold text-sm"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                {comment.username}
                              </p>
                              <span
                                className="text-[10px]"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p
                              className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {comment.comment}
                            </p>
                          </div>

                          {comment.isFailed && (
                            <p className="text-xs mt-1 ml-2 text-red-500">Failed to send</p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-20 opacity-60"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <FaComment className="text-4xl mb-3 opacity-20" />
                      <p>No comments yet.</p>
                      <p className="text-sm">Be the first to share your thoughts!</p>
                    </div>
                  )}
                  <div ref={commentsEndRef} />
                </div>
              </div>

              {/* Input Field */}
              <div
                className="p-4 mb-13 safe-area-bottom"
                style={{
                  borderTop: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-primary)'
                }}
              >
                <form onSubmit={handleSubmitComment} className="flex items-end gap-3">
                  <img
                    src={profile?.image || '/default-profile.jpg'}
                    alt="Current profile"
                    className="w-9 h-9 rounded-full object-cover mb-1 border border-gray-100 dark:border-gray-800"
                    onError={e => e.target.src = '/default-profile.jpg'}
                  />
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full py-3 pl-5 pr-12 rounded-full text-sm transition-shadow"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid transparent',
                      }}
                      disabled={isLoading}
                      aria-label="Comment input"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isLoading}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${newComment.trim()
                        ? 'text-white bg-[#008066] hover:bg-[#006652] scale-100'
                        : 'text-gray-400 scale-90 opacity-0 pointer-events-none'
                        }`}
                      aria-label="Submit comment"
                    >
                      <FaPaperPlane className="text-xs" />
                    </button>
                  </div>
                </form>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs mt-2 ml-12"
                    style={{ color: 'var(--color-error)' }}
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommentModal;