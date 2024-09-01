import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator";

export class UpdateUserPwdDto {
    @ApiProperty({
        example: '1q2w3e4r',
        description: 'password',
    })
    @IsNotEmpty()
    @IsString()
    @Length(8, 20)
    @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '비밀번호는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
    nowpassword: string;

    @ApiProperty({
        example: '1q2w3e4r!',
        description: 'password',
    })
    @IsNotEmpty()
    @IsString()
    @Length(8, 20)
    @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '비밀번호는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
    newpassword: string;
}