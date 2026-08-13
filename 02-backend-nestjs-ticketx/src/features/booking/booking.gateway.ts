import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AppConfig } from '../../config/configuration';

function showtimeRoom(showtimeId: string): string {
  return `showtime:${showtimeId}`;
}

@WebSocketGateway({
  namespace: '/showtimes',
  cors: { origin: true, credentials: true },
})
export class BookingGateway implements OnGatewayConnection {
  private readonly logger = new Logger(BookingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  handleConnection(client: Socket): void {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      this.jwtService.verify(token, {
        secret: this.configService.get('jwt', { infer: true })!.accessSecret,
      });
    } catch {
      this.logger.warn(`Rejected WS connection ${client.id}: invalid token`);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showtimeId: string },
  ): void {
    void client.join(showtimeRoom(data.showtimeId));
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { showtimeId: string },
  ): void {
    void client.leave(showtimeRoom(data.showtimeId));
  }

  emitSeatLocked(showtimeId: string, seatId: string, expiresAt: Date): void {
    this.server
      .to(showtimeRoom(showtimeId))
      .emit('seat:locked', { seatId, expiresAt });
  }

  emitSeatReleased(showtimeId: string, seatId: string): void {
    this.server.to(showtimeRoom(showtimeId)).emit('seat:released', { seatId });
  }

  emitSeatBooked(showtimeId: string, seatId: string): void {
    this.server.to(showtimeRoom(showtimeId)).emit('seat:booked', { seatId });
  }
}
