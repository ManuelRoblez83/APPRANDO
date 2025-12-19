import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, User } from 'lucide-react';
import { fetchHikeComments, addComment, deleteComment } from '../services/communityService';
import { HikeComment } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  hikeId: string;
  initialCommentsCount?: number;
  onCommentsChange?: (commentsCount: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  hikeId,
  initialCommentsCount = 0,
  onCommentsChange,
}) => {
  const [comments, setComments] = useState<HikeComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, hikeId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await fetchHikeComments(hikeId);
      setComments(fetchedComments);
      onCommentsChange?.(fetchedComments.length);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = await addComment(hikeId, newComment);
      if (comment) {
        setComments((prev) => [...prev, comment]);
        setNewComment('');
        onCommentsChange?.(comments.length + 1);
        toast.success('Commentaire ajouté');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout du commentaire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentsChange?.(comments.length - 1);
      toast.success('Commentaire supprimé');
    } catch (error: any) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const getUserDisplayName = (comment: HikeComment): string => {
    if (comment.userProfile?.nickname) {
      return comment.userProfile.nickname;
    }
    if (comment.userProfile?.firstName) {
      return comment.userProfile.firstName + (comment.userProfile.lastName ? ` ${comment.userProfile.lastName}` : '');
    }
    return 'Utilisateur anonyme';
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 rounded-full hover:bg-stone-200 dark:hover:bg-stone-600 transition-all duration-200"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-medium">
          {initialCommentsCount} commentaire{initialCommentsCount > 1 ? 's' : ''}
        </span>
      </button>

      {showComments && (
        <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-4 space-y-4 border border-stone-200 dark:border-stone-700">
          {isLoading ? (
            <div className="text-center py-4 text-stone-500 dark:text-stone-400">
              Chargement des commentaires...
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center text-stone-500 dark:text-stone-400 text-sm py-4">
                    Aucun commentaire pour le moment. Soyez le premier à commenter !
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white dark:bg-stone-900 rounded-xl p-3 space-y-2 border border-stone-200 dark:border-stone-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-stone-800 dark:text-stone-200 truncate">
                              {getUserDisplayName(comment)}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        {currentUserId === comment.userId && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Supprimer le commentaire"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {currentUserId && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

