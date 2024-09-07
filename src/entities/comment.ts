import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm";
import { User } from './user';
import { Post } from './post';

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    content!: string;

    @Column({ nullable: false })
    name!: String; 
    @Column({ nullable: false })
    email!: String; 

    @Column({ nullable: false })
    postId!: string;

    @ManyToOne(() => Post, (post) => post.comments, { nullable: false, onDelete: 'CASCADE' })
    post!: Post;

    @Column({ nullable: true })
    userId!: string | null;

    @ManyToOne(() => User, (user) => user.comments, { nullable: true, onDelete: 'CASCADE' })
    user!: User | null;
}
