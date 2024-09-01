import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator";

export class UpdateUserNickDto {
    @ApiProperty({
        example: '홍길동아님',
        description: 'nickname',
    })
    @IsNotEmpty()
    @IsString()
    @Length(2, 10)
    @Matches(/^[a-zA-Z0-9가-힣!@#$^*?_%]+$/, { message: '닉네임은 영문자, 숫자, 한글, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
    nickname: string;
}