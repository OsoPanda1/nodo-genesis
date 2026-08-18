/* ============================================================================
 * RDM DIGITAL — NODO CERO 3D ENGINE
 * Zero-Copy Binary Protocol Serialization & Deserialization Pipeline
 * High-Efficiency Edge-to-Node Payload Formats over WebSockets / QUIC
 * ============================================================================ */

export enum PacketOpcode {
  Heartbeat = 0x01,
  PlayerTransformSync = 0x02,
  GamificationEvent = 0x03,
  CRDTSyncPayload = 0x04,
  EmergencyLockdown = 0xFF,
}

export type BinaryPlayerTransformPacket = {
  opcode: PacketOpcode.PlayerTransformSync;
  sequenceId: number;
  entityId: number;
  posX: number;
  posY: number;
  posZ: number;
  rotY: number;
};

export class BinaryProtocolCodec {
  /**
   * Serialize Player Transform (1 + 4 + 4 + 4 + 4 + 4 + 4 = 25 Bytes Fixed Header)
   */
  public static encodePlayerTransform(packet: BinaryPlayerTransformPacket): ArrayBuffer {
    const buffer = new ArrayBuffer(25);
    const view = new DataView(buffer);

    view.setUint8(0, packet.opcode);
    view.setUint32(1, packet.sequenceId, true); // Little-endian
    view.setUint32(5, packet.entityId, true);
    view.setFloat32(9, packet.posX, true);
    view.setFloat32(13, packet.posY, true);
    view.setFloat32(17, packet.posZ, true);
    view.setFloat32(21, packet.rotY, true);

    return buffer;
  }

  /**
   * Deserialize Player Transform Packet
   */
  public static decodePlayerTransform(buffer: ArrayBuffer): BinaryPlayerTransformPacket {
    const view = new DataView(buffer);
    const opcode = view.getUint8(0);
    if (opcode !== PacketOpcode.PlayerTransformSync) {
      throw new Error(`[BinaryProtocol] Opcode mismatch: expected ${PacketOpcode.PlayerTransformSync}, got ${opcode}`);
    }

    return {
      opcode: PacketOpcode.PlayerTransformSync,
      sequenceId: view.getUint32(1, true),
      entityId: view.getUint32(5, true),
      posX: view.getFloat32(9, true),
      posY: view.getFloat32(13, true),
      posZ: view.getFloat32(17, true),
      rotY: view.getFloat32(21, true),
    };
  }

  /**
   * Encode Generic Event Packet with UTF-8 payload bytes
   */
  public static encodeEventPacket(opcode: PacketOpcode, payload: string): ArrayBuffer {
    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(payload);
    const buffer = new ArrayBuffer(1 + 4 + payloadBytes.byteLength);
    const view = new DataView(buffer);

    view.setUint8(0, opcode);
    view.setUint32(1, payloadBytes.byteLength, true);

    const targetArray = new Uint8Array(buffer, 5);
    targetArray.set(payloadBytes);

    return buffer;
  }

  /**
   * Decode Generic Event Packet
   */
  public static decodeEventPacket(buffer: ArrayBuffer): { opcode: PacketOpcode; payload: string } {
    const view = new DataView(buffer);
    const opcode = view.getUint8(0);
    const length = view.getUint32(1, true);

    const payloadBytes = new Uint8Array(buffer, 5, length);
    const decoder = new TextDecoder();
    const payload = decoder.decode(payloadBytes);

    return { opcode, payload };
  }
}
