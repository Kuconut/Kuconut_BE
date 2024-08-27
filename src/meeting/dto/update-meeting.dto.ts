import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateMeetingDto {
    @ApiProperty({
        example: '1',
        description: 'The id of the meeting',
    })
    @IsNotEmpty()
    meeting_id: number;

    @ApiProperty({
        example: 'A meeting for chicken lovers',
        description: 'The description of the meeting',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(2047)
    meeting_description: string;


    @ApiProperty({
        example: 1,
        description: 'The minimum number of users in the meeting',
    })
    @IsNotEmpty()
    min_user: number;

    @ApiProperty({
        example: 10,
        description: 'The maximum number of users in the meeting',
    })
    @IsNotEmpty()
    max_user: number;
}
