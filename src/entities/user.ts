import { Entity, PrimaryGeneratedColumn, Column ,BaseEntity , ManyToOne , OneToMany} from "typeorm"
import{Post} from './post'
import {Comment} from './comment'
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({nullable:false})
    name!: String

    @Column({nullable:false})
    email!: String

    @Column({nullable:false})
    password!: String

    @Column({nullable:false})
    phone!: Number

    @Column({nullable:false , default:false})
    activedAccount!: Boolean

    @Column({nullable:true})
    hashedActivationCode!: String 

    @Column({nullable:true})
    hashedResetPasswordCode!: String 

    @Column({nullable:true})
    hashedChangeEmailCode!: String 

    @OneToMany(() => Post, (post) => post.user, { cascade: true, onDelete: 'CASCADE' })
    posts!: Post[];

    @OneToMany(() => Comment, (comment) => comment.user, { cascade: true, onDelete: 'CASCADE' })
    comments!: Comment[];
}