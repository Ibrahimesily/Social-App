import { Entity, PrimaryGeneratedColumn, Column ,BaseEntity , ManyToOne , OneToMany  } from "typeorm"
import {User} from './user'
import {Comment} from './comment'
@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({nullable:false})
    title!: String

    @Column({nullable:false})
    content!: String

    @Column({nullable:false , default:true})
    isPublic!: Boolean

    @Column({nullable:false})
    userId!: String

    @ManyToOne(() => User, (user) => user.posts, { nullable: true, onDelete: 'CASCADE' })
    user!: User | null;

    @OneToMany(() => Comment, (comment) => comment.post, { cascade: true, onDelete: 'CASCADE' })
    comments!: Comment[] | null;


}