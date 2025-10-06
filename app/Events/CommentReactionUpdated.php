<?php
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentReactionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $taskId;
    public int $commentId;
    public array $reactions;

    public function __construct(int $taskId, int $commentId, array $reactions)
    {
        $this->taskId = $taskId;
        $this->commentId = $commentId;
        $this->reactions = $reactions;
    }

    public function broadcastOn()
    {
        return new Channel('task.' . $this->taskId);
    }

    public function broadcastAs()
    {
        return 'comment.reacted';
    }
}

