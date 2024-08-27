import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class MeetingCommentIdDto {
    @ApiProperty({
        example: 1,
        description: 'The id of the meeting comment',
    })
    @IsNotEmpty()
    meeting_comment_id: number;
}