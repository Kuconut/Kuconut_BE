import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/security/passport.jwt.strategy';
import { Meeting } from 'src/meeting/entities/meeting.entity';
import { MeetingModule } from 'src/meeting/meeting.module';
import { MeetingComment } from 'src/meeting/entities/meeting.comment.entity';
import { MailModule } from 'src/mail/mail.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [

    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true}),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      extra: {
        socketPath: process.env.DB_SOCKETPATH
      },
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Meeting, MeetingComment],
      migrations: [__dirname + '/src/migrations/*.ts'],
      autoLoadEntities: true,
      charset: 'utf8mb4',
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      keepConnectionAlive: true,
      timezone: '+09:00',
    }),
    CacheModule.register({
      ttl: 60000,
      max: 100,
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    MeetingModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
