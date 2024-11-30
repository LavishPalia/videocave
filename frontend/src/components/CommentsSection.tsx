import React, { useState } from "react";
import {
  useAddCommentMutation,
  useGetVideoCommentsQuery,
} from "@/slices/commentsApiSlice";
import { useGetCurrentUserQuery } from "@/slices/usersApiSlice";
import Button from "@/components/Button";
import { formatTimeAgo } from "@/utils/formatTimeAgo";
import { ThumbsDown, ThumbsUp, EllipsisVertical } from "lucide-react";
import { toast } from "react-toastify";

const CommentsSection = ({ videoId }: { videoId: string }) => {
  const [enteredComment, setEnteredComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);

  const { data: comments, refetch: refetchComments } = useGetVideoCommentsQuery(
    videoId,
    { skip: !videoId }
  );

  const { data: loggedInUser } = useGetCurrentUserQuery(null);
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();

  const handleCommentInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnteredComment(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleAddComment = async () => {
    try {
      if (enteredComment.trim()) {
        await addComment({ videoId, comment: enteredComment });
        setEnteredComment("");
        setIsFocused(false);
        toast.success(`Comment added"`);
        refetchComments();
      }
    } catch (error) {
      setEnteredComment("");
      setIsFocused(false);
      toast.error("Failed to add comment");
    }
  };

  const handleCancel = () => {
    setEnteredComment("");
    setIsFocused(false);
  };

  return (
    <div className="pt-4">
      <p className="text-xl">{comments?.data?.count} Comments</p>
      <div className="flex gap-4 pt-8">
        <img
          src={loggedInUser?.data?.avatar}
          alt={loggedInUser?.data?.fullName}
          className="object-cover object-center rounded-full size-12"
          loading="lazy"
        />
        <input
          type="text"
          className="w-full h-5 pb-1 bg-transparent border-b-2 focus:border-b-2 focus:border-gray-100 focus:outline-none"
          placeholder="Add a comment..."
          value={enteredComment}
          onChange={handleCommentInput}
          onFocus={handleFocus}
        />
      </div>

      {isFocused && (
        <div className="flex justify-end gap-2 mt-2">
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="px-4 text-sm rounded-3xl dark:hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddComment}
            variant={enteredComment === "" ? "disabled" : "ghost"}
            className={`px-4 rounded-3xl text-sm ${
              enteredComment === ""
                ? "text-gray-500"
                : "dark:bg-[#3ea6ff] text-black dark:hover:dark:bg-[#3ea5ffdd]"
            }`}
            disabled={enteredComment === "" || isAddingComment}
          >
            Comment
          </Button>
        </div>
      )}
      {comments?.data?.videoComments?.map(
        (comment: {
          _id: string;
          userDetails: {
            userName: string;
            avatar: string;
            fullName: string;
          }[];
          updatedAt: Date;
          content: string;
        }) => (
          <div
            className="flex w-full gap-4 mt-4"
            key={comment._id}
            onMouseEnter={() => setHoveredCommentId(comment._id)}
            onMouseLeave={() => setHoveredCommentId(null)}
          >
            <img
              src={comment?.userDetails[0]?.avatar}
              alt={comment?.userDetails[0]?.fullName}
              className="object-cover object-center rounded-full size-12"
              loading="lazy"
            />
            <div className="flex flex-col grow">
              <div className="flex gap-4">
                <p key={comment._id}>@{comment?.userDetails[0]?.userName}</p>
                <p key={comment._id}>
                  {formatTimeAgo(new Date(comment?.updatedAt))}
                </p>
                <div
                  className={`flex self-center ml-auto ${
                    hoveredCommentId === comment._id ? "" : "hidden"
                  } absolute right-2`}
                >
                  <Button variant="ghost" size="icon">
                    <EllipsisVertical size={20} className="cursor-pointer" />
                  </Button>
                </div>
              </div>

              <p key={comment._id} className="w-[95%]">
                {comment?.content}
              </p>

              <div className="flex">
                <Button variant="ghost" size="icon" className="justify-normal">
                  <ThumbsUp size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="justify-normal">
                  <ThumbsDown size={16} />
                </Button>

                <button className="pl-4 text-xs">Reply</button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default CommentsSection;
