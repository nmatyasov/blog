export class PostFilterDto {
  /*@ApiProperty({
    description: 'The search keyword in the title and description of the task',
    nullable: true,
  })*/
  keyword?: string;

  //@ApiProperty({ description: 'How many tasks to choose', nullable: true })
  limit?: number;
  /*@ApiProperty({
    description: 'How many tasks to skip in the selection',
    nullable: true,
  })*/
  skip?: number;

  tag?: string;
}
